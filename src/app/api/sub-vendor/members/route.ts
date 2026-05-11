import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
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

    // Get all users who are members and have this subVendorCode
    const memberUsers = await User.find({ 
      subVendorCode: subVendor.subVendorCode,
      role: 'member'
    }).select('_id');

    const memberIds = memberUsers.map(m => m._id);

    const members = await WomenMember.find({ 
      userId: { $in: memberIds }
    }).populate('assignedEmployeeId', 'fullName employeeId');

    return successResponse(members);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
