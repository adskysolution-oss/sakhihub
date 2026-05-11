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

    // Find all groups where the assigned employee belongs to this sub-vendor's network
    const groups = await Group.find({})
      .populate('assignedEmployeeId', 'fullName employeeId subVendorCode');

    const filteredGroups = groups.filter(g => 
      (g.assignedEmployeeId as any)?.subVendorCode === subVendor.subVendorCode
    );

    return successResponse(filteredGroups);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
