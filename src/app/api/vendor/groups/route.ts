import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Group from '@/models/Group';
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

    // Find all groups where the assigned employee belongs to this vendor's network
    // This requires a join/populate or multiple queries. 
    // Simplified for now: Get all groups, we'll need to filter by employee network later.
    const groups = await Group.find({})
      .populate('assignedEmployeeId', 'fullName employeeId vendorCode subVendorCode');

    // Filter groups where the assigned employee belongs to this vendor
    const filteredGroups = groups.filter(g => 
      (g.assignedEmployeeId as any)?.vendorCode === vendor.vendorCode
    );

    return successResponse(filteredGroups);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
