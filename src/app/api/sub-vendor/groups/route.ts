import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    const subVendor = await User.findById((session as any).id);
    if (!subVendor) return errorResponse('Sub-Vendor not found', 404);

    // Get employees under this sub-vendor
    const employees = await User.find({
      parentVendorId: subVendor._id,
      role: 'employee'
    }).select('_id');

    const employeeIds = employees.map(emp => emp._id);

    // Build query for Group
    const queryOr: any[] = [];
    if (subVendor.subVendorCode) queryOr.push({ subVendorCode: subVendor.subVendorCode });
    if (employeeIds.length > 0) queryOr.push({ createdBy: { $in: employeeIds } });
    
    // Fallback: groups directly created by the subVendor
    queryOr.push({ createdBy: subVendor._id });

    const groups = await Group.find({ $or: queryOr })
      .populate('createdBy', 'fullName employeeId subVendorCode')
      .populate('campaignId', 'title');

    return successResponse(groups);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
