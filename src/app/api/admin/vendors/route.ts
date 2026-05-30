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
    const dateRange = searchParams.get('dateRange'); // 'all', 'today', 'yesterday', 'custom'
    const customDate = searchParams.get('customDate'); // 'YYYY-MM-DD'
    const paymentStatus = searchParams.get('paymentStatus'); // 'all', 'paid', 'unpaid'

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

    // Date Filtering
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      if (dateRange === 'today') {
        query.createdAt = { $gte: startOfToday };
      } else if (dateRange === 'yesterday') {
        query.createdAt = { $gte: startOfYesterday, $lt: startOfToday };
      } else if (dateRange === 'custom' && customDate) {
        const customStart = new Date(customDate);
        customStart.setHours(0, 0, 0, 0);
        const customEnd = new Date(customDate);
        customEnd.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: customStart, $lte: customEnd };
      }
    }
    
    // Payment Filtering
    if (paymentStatus && paymentStatus !== 'all') {
      if (paymentStatus === 'paid') {
        query.$or = [{ paymentCompleted: true }, { subscriptionPaid: true }];
      } else if (paymentStatus === 'unpaid') {
        query.$and = [
          { paymentCompleted: { $ne: true } },
          { subscriptionPaid: { $ne: true } }
        ];
      }
    }

    const vendors = await User.find(query).sort({ createdAt: -1 }).select('-password');
    return successResponse(vendors);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
