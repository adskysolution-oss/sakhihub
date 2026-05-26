import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import ManualPaymentRequest from '@/models/ManualPaymentRequest';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const sessionUser = session as any;

    await dbConnect();

    const user = await User.findById(sessionUser.id).select('role subscriptionPaid depositPaid');
    if (!user) return errorResponse('User not found', 404);

    if (!['vendor', 'sub_vendor', 'employee'].includes(user.role)) {
      return errorResponse('Manual payment request is not supported for your role', 400);
    }

    const body = await req.json();
    const { type, name, mobile, vendorOrSubVendorId, amount, transactionId, paymentDate, remark } = body;

    // Validate type
    if (!['subscription', 'deposit'].includes(type)) {
      return errorResponse('Invalid payment type. Must be "subscription" or "deposit".', 400);
    }

    // Check if already paid
    if (type === 'subscription' && user.subscriptionPaid) {
      return errorResponse('Subscription is already paid', 400);
    }
    if (type === 'deposit' && user.depositPaid) {
      return errorResponse('Security deposit is already paid', 400);
    }

    // Validate required fields
    const missing: string[] = [];
    if (!name?.trim()) missing.push('name');
    if (!mobile?.trim()) missing.push('mobile');
    if (!vendorOrSubVendorId?.trim()) missing.push('vendorOrSubVendorId');
    if (!amount || Number(amount) <= 0) missing.push('amount');
    if (!transactionId?.trim()) missing.push('transactionId');
    if (!paymentDate) missing.push('paymentDate');

    if (missing.length > 0) {
      return errorResponse(`Missing required fields: ${missing.join(', ')}`, 400);
    }

    // Check for existing pending request for same user+type to prevent duplicates
    const existingPending = await ManualPaymentRequest.findOne({
      userId: sessionUser.id,
      type,
      status: 'pending',
    });

    if (existingPending) {
      return errorResponse(
        'You already have a pending verification request for this payment type. Please wait for admin review.',
        409
      );
    }

    const request = await ManualPaymentRequest.create({
      userId: sessionUser.id,
      type,
      name: name.trim(),
      mobile: mobile.trim(),
      vendorOrSubVendorId: vendorOrSubVendorId.trim(),
      amount: Number(amount),
      transactionId: transactionId.trim(),
      paymentDate: new Date(paymentDate),
      remark: remark?.trim() || '',
      status: 'pending',
    });

    return successResponse(
      { requestId: request._id },
      'Payment verification request submitted successfully. Admin will review and unlock your next step.'
    );
  } catch (error: any) {
    console.error('Manual Payment Request Error:', error);
    return errorResponse(error.message || 'Failed to submit payment verification request', 500);
  }
}

/**
 * GET – returns the current user's latest manual payment request status
 * so the frontend can show the right UI after submission.
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();

    const requests = await ManualPaymentRequest.find({ userId: (session as any).id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return successResponse(requests, 'Manual payment requests retrieved');
  } catch (error: any) {
    console.error('Get Manual Payment Requests Error:', error);
    return errorResponse(error.message || 'Failed to fetch requests', 500);
  }
}
