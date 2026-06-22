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
    const statusParam = searchParams.get('status');
    const roleParam = searchParams.get('role');

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;
    const skip = (page - 1) * limit;

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
    } else if (statusParam === 'pending_payment') {
      query = { documentsVerified: true, paymentCompleted: false, role: { $in: ['vendor', 'sub_vendor', 'employee'] } };
    }

    // Apply additional filters (if not overridden by pending_payment logic)
    if (statusParam && statusParam !== 'pending_payment' && statusParam !== 'all') {
      query.status = statusParam;
    }
    if (roleParam && roleParam !== 'all') {
      query.role = roleParam;
    }

    // Role-based view permissions filtering
    const sessionRole = (session as any).role;
    if (sessionRole !== 'super_admin') {
      const allowedRoles: string[] = [];
      
      if (sessionRole === 'admin') {
        allowedRoles.push('vendor', 'sub_vendor', 'employee', 'staff', 'member');
      } else {
        if (await hasPermission(currentUserId, sessionRole, 'vendors.view')) {
          allowedRoles.push('vendor');
        }
        if (await hasPermission(currentUserId, sessionRole, 'sub_vendors.view')) {
          allowedRoles.push('sub_vendor');
        }
        if (await hasPermission(currentUserId, sessionRole, 'employees.view')) {
          allowedRoles.push('employee', 'staff');
        }
        if (await hasPermission(currentUserId, sessionRole, 'members.view')) {
          allowedRoles.push('member');
        }
      }

      if (query.role) {
        if (typeof query.role === 'string') {
          if (!allowedRoles.includes(query.role)) {
            query.role = '__none__';
          }
        } else if (query.role.$in) {
          query.role = { $in: query.role.$in.filter((r: string) => allowedRoles.includes(r)) };
        } else {
          query.role = { $in: allowedRoles };
        }
      } else {
        query.role = { $in: allowedRoles };
      }
    }

    const { applyRegionalFilter } = await import('@/utils/authHelpers');
    query = await applyRegionalFilter(query, session);

    const totalCount = await User.countDocuments(query);
    const users = await User.find(query)
      .select('fullName mobile email role status subscriptionPaid depositPaid documentsVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return Response.json({
      success: true,
      data: users,
      totalCount,
      page,
      limit
    });
  } catch (error: any) {
    console.error('Fetch Users Error:', error);
    return errorResponse(error.message || 'Failed to fetch users', 500);
  }
}
