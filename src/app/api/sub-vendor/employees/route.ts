import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    // Get this sub-vendor's code
    const subVendor = await User.findById((session as any).id);
    if (!subVendor) return errorResponse('Sub-Vendor not found', 404);

    // Find all employees where subVendorCode matches
    const employees = await User.find({ 
      subVendorCode: subVendor.subVendorCode,
      role: 'employee'
    }).select('-password');

    return successResponse(employees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
