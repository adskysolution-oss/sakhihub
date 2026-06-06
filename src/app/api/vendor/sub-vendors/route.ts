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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const query: any = { 
      parentVendorId: (session as any).id,
      role: 'sub_vendor'
    };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { subVendorCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const subVendors = await User.find(query).select('-password');

    return successResponse(subVendors);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
