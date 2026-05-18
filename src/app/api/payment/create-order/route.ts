import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import PaymentTransaction from '@/models/PaymentTransaction';
import { createCashfreeOrder, generateOrderId, isCashfreeConfigured } from '@/lib/cashfree';

import CommissionConfig from '@/models/CommissionConfig';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { type } = await req.json();
    if (!['subscription', 'deposit'].includes(type)) {
      return errorResponse('Invalid payment type. Must be "subscription" or "deposit".', 400);
    }

    if (!isCashfreeConfigured()) {
      return errorResponse('Payment gateway is not configured. Please contact admin.', 503);
    }

    await dbConnect();

    const user = await User.findById((session as any).id);
    if (!user) return errorResponse('User not found', 404);

    // Check if user's role requires payment
    if (!['vendor', 'sub_vendor', 'employee', 'member'].includes(user.role)) {
      return errorResponse('Payment is not required for your role', 400);
    }

    // Check if already paid for this type
    if (type === 'subscription' && user.subscriptionPaid) {
      return errorResponse('Subscription is already paid', 400);
    }
    if (type === 'deposit' && user.depositPaid) {
      return errorResponse('Security deposit is already paid', 400);
    }

    let amount = 0;

    if (user.role === 'member') {
      if (type !== 'subscription') {
        return errorResponse('Only subscription payment is supported for members', 400);
      }
      const commConfig = await CommissionConfig.findOne({ key: 'default' });
      amount = commConfig ? (commConfig.membershipFee ?? 100) : 100;
    } else {
      // Get payment config
      let config = await PaymentConfig.findOne({ key: 'default' });
      if (!config) {
        // Create default config if none exists
        config = await PaymentConfig.create({
          key: 'default',
          subscriptionAmount: { vendor: 5000, sub_vendor: 3000, employee: 1000 },
          depositAmount: { vendor: 10000, sub_vendor: 5000, employee: 2000 },
          paymentRequired: { vendor: true, sub_vendor: true, employee: true },
          subscriptionRequired: { vendor: true, sub_vendor: true, employee: true },
          depositRequired: { vendor: true, sub_vendor: true, employee: true },
        });
      }

      const roleKey = user.role as 'vendor' | 'sub_vendor' | 'employee';

      // Check if this payment type is required for the role
      if (type === 'subscription' && !config.subscriptionRequired[roleKey]) {
        return errorResponse('Subscription is not required for your role', 400);
      }
      if (type === 'deposit' && !config.depositRequired[roleKey]) {
        return errorResponse('Security deposit is not required for your role', 400);
      }

      amount = type === 'subscription'
        ? config.subscriptionAmount[roleKey]
        : config.depositAmount[roleKey];
    }

    if (!amount || amount <= 0) {
      return errorResponse('Payment amount is not configured. Please contact admin.', 400);
    }

    // Check for existing pending order for same type (prevent duplicate orders)
    let existingPending = await PaymentTransaction.findOne({
      userId: user._id,
      type,
      status: { $in: ['created', 'pending'] }
    });

    if (existingPending && existingPending.paymentSessionId.startsWith('mock_session_')) {
      await PaymentTransaction.deleteOne({ _id: existingPending._id });
      existingPending = null;
    }

    if (existingPending) {
      // Return the existing order's payment session
      return successResponse({
        orderId: existingPending.cashfreeOrderId,
        paymentSessionId: existingPending.paymentSessionId,
        amount: existingPending.amount,
        type,
        existing: true,
      }, 'Existing payment order found');
    }

    // Generate unique order ID
    const orderId = generateOrderId(user._id.toString(), type);

    // Cashfree Production requires HTTPS URLs
    let returnUrl = user.role === 'member'
      ? `${BASE_URL}/member/receipt?order_id=${orderId}&type=${type}`
      : `${BASE_URL}/payment-pending?order_id=${orderId}&type=${type}`;
    let notifyUrl = `${BASE_URL}/api/payment/webhook`;
    
    if (process.env.CASHFREE_ENV === 'production' || process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production') {
      returnUrl = returnUrl.replace('http://', 'https://');
      notifyUrl = notifyUrl.replace('http://', 'https://');
    }

    // Create Cashfree order
    const cashfreeOrder = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      customerName: user.fullName,
      customerPhone: user.mobile,
      customerEmail: user.email,
      returnUrl,
      notifyUrl,
    });

    // Save transaction record
    await PaymentTransaction.create({
      userId: user._id,
      type,
      role: user.role,
      amount,
      status: 'created',
      cashfreeOrderId: orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
    });

    return successResponse({
      orderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount,
      type,
    }, 'Payment order created successfully');
  } catch (error: any) {
    console.error('Create Payment Order Error:', error);
    return errorResponse(error.message || 'Failed to create payment order', 500);
  }
}
