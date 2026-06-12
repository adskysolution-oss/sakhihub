import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

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
      await hasPermission(currentUserId, (session as any).role, 'vendors.view') ||
      await hasPermission(currentUserId, (session as any).role, 'sub_vendors.view') ||
      await hasPermission(currentUserId, (session as any).role, 'employees.view');

    if (!isAuthorized) {
      return errorResponse('Forbidden', 403);
    }

    await dbConnect();
    
    // Fetch all vendors and sub-vendors
    const partners = await User.find({
      role: { $in: ['vendor', 'sub_vendor'] },
      status: 'active'
    })
    .select('fullName role mobile vendorCode subVendorCode parentVendorId')
    .sort({ role: 1, fullName: 1 });

    return successResponse(partners);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
