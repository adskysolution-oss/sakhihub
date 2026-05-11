import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    // Get this vendor's code
    const vendor = await User.findById((session as any).id);
    if (!vendor) return errorResponse('Vendor not found', 404);

    // Find all employees where vendorCode matches this vendor
    const employees = await User.find({ 
      vendorCode: vendor.vendorCode,
      role: 'employee'
    }).select('-password');

    return successResponse(employees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
