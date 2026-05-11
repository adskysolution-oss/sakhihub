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

    // Get all users who are members and have this vendorCode
    const memberUsers = await User.find({ 
      vendorCode: vendor.vendorCode,
      role: 'member'
    }).select('_id');

    const memberIds = memberUsers.map(m => m._id);

    // Fetch details from WomenMember collection
    const members = await WomenMember.find({ 
      userId: { $in: memberIds }
    }).populate('assignedEmployeeId', 'fullName employeeId');

    return successResponse(members);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
