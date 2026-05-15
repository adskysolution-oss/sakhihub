import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    // Fetch all vendors and sub-vendors
    const partners = await User.find({
      role: { $in: ['vendor', 'sub_vendor'] },
      status: 'active'
    })
    .select('fullName role mobile vendorCode subVendorCode')
    .sort({ role: 1, fullName: 1 });

    return successResponse(partners);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
