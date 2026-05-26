import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession, signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import PaymentTransaction from '@/models/PaymentTransaction';
import ManualPaymentRequest from '@/models/ManualPaymentRequest';
import { distributeCommission } from '@/lib/commission';

/**
 * GET /api/admin/manual-payment-requests
 * Returns all manual payment verification requests, optionally filtered by status.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // pending | approved | rejected | (omit for all)

    const query: any = {};
    if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    const requests = await ManualPaymentRequest.find(query)
      .populate('userId', 'fullName mobile role vendorCode subVendorCode')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(requests, 'Manual payment requests retrieved');
  } catch (error: any) {
    console.error('Admin Manual Payment Requests GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch requests', 500);
  }
}

/**
 * PATCH /api/admin/manual-payment-requests
 * Approve or reject a manual payment verification request.
 * On approval, reuses the existing override logic to mark the user's payment as paid.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();

    const body = await req.json();
    const { requestId, action, adminRemark } = body;

    if (!requestId) return errorResponse('Request ID is required', 400);
    if (!['approve', 'reject'].includes(action)) {
      return errorResponse('Invalid action. Must be "approve" or "reject".', 400);
    }

    const request = await ManualPaymentRequest.findById(requestId);
    if (!request) return errorResponse('Manual payment request not found', 404);

    if (request.status !== 'pending') {
      return errorResponse(`Request is already ${request.status}`, 409);
    }

    const adminId = (session as any).id;

    if (action === 'reject') {
      request.status = 'rejected';
      request.reviewedBy = adminId;
      request.reviewedAt = new Date();
      request.adminRemark = adminRemark?.trim() || '';
      await request.save();

      return successResponse({ status: 'rejected' }, 'Payment request rejected');
    }

    // ─── APPROVE ──────────────────────────────────────────────────────────────
    const user = await User.findById(request.userId);
    if (!user) return errorResponse('User not found', 404);

    const { type } = request;

    // Guard: don't double-pay
    if (type === 'subscription' && user.subscriptionPaid) {
      return errorResponse('Subscription is already marked as paid for this user', 409);
    }
    if (type === 'deposit' && user.depositPaid) {
      return errorResponse('Security deposit is already marked as paid for this user', 409);
    }

    // Mark the payment on the user
    if (type === 'subscription') user.subscriptionPaid = true;
    if (type === 'deposit') user.depositPaid = true;

    // Check if all payments are now complete and unlock access accordingly
    const roleKey = user.role as 'vendor' | 'sub_vendor' | 'employee';
    const config = await PaymentConfig.findOne({ key: 'default' });

    if (config) {
      const subRequired = config.subscriptionRequired[roleKey];
      const depRequired = config.depositRequired[roleKey];
      const subPaid = user.subscriptionPaid || !subRequired;
      const depPaid = user.depositPaid || !depRequired;

      if (subPaid && depPaid) {
        user.paymentCompleted = true;

        if (user.documentsVerified) {
          if (user.role === 'vendor') {
            user.dashboardAccess = true;
            user.onboardingCompleted = true;
            if (!['active'].includes(user.status)) user.status = 'active';
          }
          if (['sub_vendor', 'employee'].includes(user.role) && user.assignmentStatus === 'completed') {
            user.dashboardAccess = true;
            user.onboardingCompleted = true;
            if (!['active'].includes(user.status)) user.status = 'active';
          }
        }
      }
    }

    await user.save();

    // Create a PaymentTransaction record for audit trail
    // Uses the same pattern as ADMIN_OVERRIDE but tags it as manual_payment_request
    const refId = `MANUAL_REQ_${user._id}_${type}_${Date.now()}`;
    const existingTxn = await PaymentTransaction.findOne({ userId: user._id, type, status: 'paid' });
    if (!existingTxn) {
      const txn = await PaymentTransaction.create({
        userId: user._id,
        type,
        role: user.role,
        amount: request.amount,
        currency: 'INR',
        status: 'paid',
        cashfreeOrderId: refId,
        paymentMethod: 'manual_payment_request',
        paidAt: request.paymentDate || new Date(),
        gatewayResponse: {
          source: 'manual_payment_request',
          transactionId: request.transactionId,
          submittedBy: user._id,
          approvedBy: adminId,
          requestId: request._id,
        },
      });

      // Trigger upline commission distribution (same as Cashfree verify flow)
      try {
        await distributeCommission(
          user._id.toString(),
          type as 'subscription' | 'deposit',
          request.amount,
          txn.cashfreeOrderId
        );
      } catch (err) {
        console.error('[Commission Error] Failed to distribute commission for manual payment:', err);
      }
    }

    // Update the request document
    request.status = 'approved';
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.adminRemark = adminRemark?.trim() || '';
    await request.save();

    // Endpoint is now a pure mutation. No session cookies are injected here.

    return successResponse(
      {
        status: 'approved',
        paymentCompleted: user.paymentCompleted,
        dashboardAccess: user.dashboardAccess,
      },
      `${type} payment approved and user unlocked`
    );
  } catch (error: any) {
    console.error('Admin Manual Payment Requests PATCH Error:', error);
    return errorResponse(error.message || 'Failed to process request', 500);
  }
}
