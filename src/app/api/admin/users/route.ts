import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    await dbConnect();

    let query: any = {};
    if (search) {
      // Allow searching by mobile or email or exact name match
      query = {
        $or: [
          { mobile: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    } else if (searchParams.get('status') === 'pending_payment') {
      query = { documentsVerified: true, paymentCompleted: false, role: { $in: ['vendor', 'sub_vendor', 'employee'] } };
    }

    const users = await User.find(query).select('fullName mobile email role status subscriptionPaid depositPaid documentsVerified').limit(5).lean();

    return successResponse(users, 'Users retrieved successfully');
  } catch (error: any) {
    console.error('Fetch Users Error:', error);
    return errorResponse(error.message || 'Failed to fetch users', 500);
  }
}
