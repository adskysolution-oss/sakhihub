import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import MemberRequest from '@/models/MemberRequest';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { notifyGroupAddition } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    const userId = (session as any).id;
    
    // Fetch creator's profile for hierarchy
    const User = (await import('@/models/User')).default;
    const userProfile = await User.findById(userId);

    // Auto-populate district and block from group if missing
    const Group = (await import('@/models/Group')).default;
    const group = await Group.findById(body.groupId);
    if (!group) {
      return errorResponse('Associated group not found', 404);
    }

    if (!body.district) body.district = group.district;
    if (!body.block) body.block = group.block;

    const member = await WomenMember.create({
      ...body,
      createdBy: userId,
      assignedEmployeeId: userId,
      vendorCode: userProfile?.vendorCode,
      subVendorCode: userProfile?.subVendorCode,
      requestedBy: 'employee',
      connectionStatus: 'approved',
      accountStatus: 'active',
      membershipStatus: 'free'
    });

    // Notify group addition asynchronously
    if (member.groupId && member.email) {
      notifyGroupAddition(member._id, member.groupId.toString(), userId);
    }

    return successResponse(member, 'Member added successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const mode = searchParams.get('mode');
    const role = (session as any).role;
    const userId = (session as any).id;
    const User = (await import('@/models/User')).default;
    const userProfile = await User.findById(userId);

    let query: any = {};
    const groupId = searchParams.get('groupId');

    if (mode === 'discovery' && role === 'employee') {
      const employee = userProfile;
      if (!employee) return errorResponse('Employee not found', 404);
      
      query = {
        connectionStatus: 'unassigned',
        $or: [
          { block: employee.block },
          { district: employee.district }
        ],
        userId: { $exists: true } // Only show members who have a user account (self-registered)
      };
    } else if (role === 'employee') {
      query.$or = [{ createdBy: userId }, { assignedEmployeeId: userId }];
    } else if (role === 'vendor') {
      query = { vendorCode: userProfile?.vendorCode };
    } else if (role === 'sub_vendor') {
      query = { subVendorCode: userProfile?.subVendorCode };
    } else if (role !== 'super_admin') {
      return errorResponse('Forbidden', 403);
    }

    if (groupId) {
      query.groupId = groupId;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [
            { name: searchRegex },
            { mobile: searchRegex }
          ]}
        ];
        delete query.$or;
      } else {
        query.$or = [
          { name: searchRegex },
          { mobile: searchRegex }
        ];
      }
    }

    const members = await WomenMember.find(query)
      .sort({ createdAt: -1 })
      .populate('groupId', 'groupName village');

    return successResponse(members);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
