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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const query: any = { role: 'vendor' };
    if (status && status !== 'all') {
      // 'pending' filter shows all pre-approval statuses
      if (status === 'pending') {
        query.status = { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] };
      } else {
        query.status = status;
      }
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { vendorCode: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await User.find(query).sort({ createdAt: -1 }).select('-password');
    return successResponse(vendors);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
