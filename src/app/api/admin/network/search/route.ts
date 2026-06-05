import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

// Recursive helper to build path for a user
async function getUserPath(userId: mongoose.Types.ObjectId): Promise<string[]> {
  const path = [userId.toString()];
  let currentId: any = userId;

  while (currentId) {
    const user = await User.findById(currentId).select('parentVendorId').lean();
    if (user && user.parentVendorId) {
      path.unshift(user.parentVendorId.toString());
      currentId = user.parentVendorId;
    } else {
      currentId = null;
    }
  }

  path.unshift('root');
  return path;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return successResponse([]);
    }

    const regex = new RegExp(query, 'i');
    const operationalStatuses = ['active', 'approved'];

    // 1. Search in User Collection (Vendors, Sub-Vendors, Employees)
    const matchingUsers = await User.find({
      status: { $in: operationalStatuses },
      $or: [
        { fullName: regex },
        { vendorCode: regex },
        { subVendorCode: regex },
        { employeeId: regex },
        { mobile: regex }
      ]
    })
    .select('fullName role vendorCode subVendorCode employeeId parentVendorId')
    .limit(10)
    .lean();

    const results: any[] = [];

    for (const u of matchingUsers) {
      const path = await getUserPath(u._id);
      results.push({
        id: u._id.toString(),
        name: u.fullName,
        role: u.role,
        code: u.vendorCode || u.subVendorCode || u.employeeId || '',
        path
      });
    }

    // 2. Search in WomenMember Collection
    const matchingMembers = await WomenMember.find({
      accountStatus: 'active',
      $or: [
        { name: regex },
        { mobile: regex }
      ]
    })
    .select('name mobile assignedEmployeeId subVendorCode vendorCode')
    .limit(10)
    .lean();

    for (const m of matchingMembers) {
      let memberPath: string[] = [];

      if (m.assignedEmployeeId) {
        const empPath = await getUserPath(m.assignedEmployeeId);
        memberPath = [...empPath, m._id.toString()];
      } else if (m.subVendorCode) {
        const subVendor = await User.findOne({ role: 'sub_vendor', subVendorCode: m.subVendorCode }).select('_id').lean();
        if (subVendor) {
          const svPath = await getUserPath(subVendor._id);
          memberPath = [...svPath, m._id.toString()];
        }
      } else if (m.vendorCode) {
        const vendor = await User.findOne({ role: 'vendor', vendorCode: m.vendorCode }).select('_id').lean();
        if (vendor) {
          const vPath = await getUserPath(vendor._id);
          memberPath = [...vPath, m._id.toString()];
        }
      }

      if (memberPath.length > 0) {
        results.push({
          id: m._id.toString(),
          name: m.name,
          role: 'member',
          code: m.mobile,
          path: memberPath
        });
      }
    }

    return successResponse(results);
  } catch (error: any) {
    console.error('Hierarchy Search Error:', error);
    return errorResponse(error.message, 500);
  }
}
