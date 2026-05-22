import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    const vendor = await User.findById((session as any).id);
    if (!vendor) return errorResponse('Vendor not found', 404);

    // 1. Get sub-vendors under this vendor
    const subVendors = await User.find({ 
      parentVendorId: vendor._id, 
      role: 'sub_vendor'
    }).select('_id subVendorCode');

    const subVendorIds = subVendors.map(sv => sv._id);
    const subVendorCodes = subVendors.map(sv => sv.subVendorCode).filter(Boolean);

    // 2. Get all employees under vendor and sub-vendors
    const employees = await User.find({
      role: 'employee',
      $or: [
        { parentVendorId: vendor._id },
        { parentVendorId: { $in: subVendorIds } }
      ]
    }).select('_id');

    const employeeIds = employees.map(emp => emp._id);

    // 3. Build query for WomenMember
    const queryOr: any[] = [];
    if (vendor.vendorCode) queryOr.push({ vendorCode: vendor.vendorCode });
    if (subVendorCodes.length > 0) queryOr.push({ subVendorCode: { $in: subVendorCodes } });
    if (employeeIds.length > 0) queryOr.push({ assignedEmployeeId: { $in: employeeIds } });
    
    // Fallback: If nothing else, at least catch those directly created by the vendor
    queryOr.push({ createdBy: vendor._id });

    // Fetch details from WomenMember collection
    const members = await WomenMember.find({ 
      $or: queryOr
    })
    .populate('assignedEmployeeId', 'fullName employeeId')
    .sort({ createdAt: -1 });

    return successResponse(members);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
