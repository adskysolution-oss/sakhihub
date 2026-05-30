import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import PaymentTransaction from '@/models/PaymentTransaction';
import { generateOrderId, isCashfreeConfigured } from '@/lib/cashfree';
import { PaymentResolver } from '@/lib/payments/PaymentResolver';
import CommissionConfig from '@/models/CommissionConfig';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sakhihub.com';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { type } = await req.json();
    if (!['subscription', 'deposit'].includes(type)) {
      return errorResponse('Invalid payment type. Must be "subscription" or "deposit".', 400);
    }

    // Note: We don't block here with isCashfreeConfigured() anymore.
    // The PaymentResolver will handle failure if provider is missing.

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
    
    // Cashfree Production requires HTTPS URLs for return and notify endpoints
    if (!returnUrl.includes('localhost')) {
      returnUrl = returnUrl.replace('http://', 'https://');
    }
    if (!notifyUrl.includes('localhost')) {
      notifyUrl = notifyUrl.replace('http://', 'https://');
    }

    // Create Order using the resolved provider
    const provider = await PaymentResolver.resolveActiveProvider();
    
    const orderResult = await provider.createOrder({
      orderId,
      orderAmount: amount,
      customerName: user.fullName,
      customerPhone: user.mobile,
      customerEmail: user.email,
      returnUrl,
      notifyUrl,
    });

    // Save transaction record with provider info
    await PaymentTransaction.create({
      userId: user._id,
      type,
      role: user.role,
      amount,
      status: 'created',
      provider: provider.getProviderName(), // NEW FIELD
      cashfreeOrderId: orderId, // Still saving for backward compatibility, though it acts as a generic orderId now
      gatewayOrderId: orderResult.gatewayOrderId, // NEW FIELD
      paymentSessionId: orderResult.paymentSessionId || '',
    });

    return successResponse({
      orderId,
      paymentSessionId: orderResult.paymentSessionId,
      paymentUrl: orderResult.paymentUrl, // PhonePe returns paymentUrl
      amount,
      type,
      provider: provider.getProviderName(),
    }, 'Payment order created successfully');
  } catch (error: any) {
    console.error('Create Payment Order Error:', error);
    return errorResponse(error.message || 'Failed to create payment order', 500);
  }
}
