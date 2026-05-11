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

    const subVendors = await User.find({ 
      parentVendorId: (session as any).id,
      role: 'sub_vendor'
    }).select('-password');

    return successResponse(subVendors);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
