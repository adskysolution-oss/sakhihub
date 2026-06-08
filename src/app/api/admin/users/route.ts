import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission } = await import('@/utils/authHelpers');
    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      (session as any).role === 'operations_admin' ||
      await hasPermission(currentUserId, (session as any).role, 'vendors.view') ||
      await hasPermission(currentUserId, (session as any).role, 'sub_vendors.view') ||
      await hasPermission(currentUserId, (session as any).role, 'employees.view') ||
      await hasPermission(currentUserId, (session as any).role, 'members.view');

    if (!isAuthorized) {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    await dbConnect();

    let query: any = {};
    if (search) {
      // Escape regex special characters to prevent syntax errors (e.g. "+")
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cleanPhone = search.replace(/\D/g, ''); // keep only digits

      query = {
        $or: [
          { fullName: { $regex: escapedSearch, $options: 'i' } },
          { email: { $regex: escapedSearch, $options: 'i' } }
        ]
      };

      if (cleanPhone) {
        query.$or.push({ mobile: { $regex: cleanPhone, $options: 'i' } });
      } else {
        query.$or.push({ mobile: { $regex: escapedSearch, $options: 'i' } });
      }
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
