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

    // Create Order using the resolved provider
    const provider = await PaymentResolver.resolveActiveProvider();

    // Check for existing pending order for same type and amount (prevent duplicate orders)
    let existingPending = await PaymentTransaction.findOne({
      userId: user._id,
      type,
      amount,
      status: { $in: ['created', 'pending'] }
    });

    if (existingPending && existingPending.paymentSessionId && existingPending.paymentSessionId.startsWith('mock_session_')) {
      console.log(`[Transaction Clean] Deleting mock session transaction: ${existingPending._id}`);
      await PaymentTransaction.deleteOne({ _id: existingPending._id });
      existingPending = null;
    }

    // If the provider of the existing transaction is different from the currently active provider,
    // or if it's PhonePe but doesn't have a saved paymentUrl, we discard it to generate a new order.
    if (existingPending) {
      if (existingPending.provider !== provider.name) {
        console.log(`[Provider Mismatch] Active provider changed from ${existingPending.provider} to ${provider.name}. Discarding old transaction ${existingPending._id}.`);
        await PaymentTransaction.deleteOne({ _id: existingPending._id });
        existingPending = null;
      } else if (provider.name === 'phonepe' && !(existingPending as any).paymentUrl) {
        console.log(`[Missing PaymentUrl] PhonePe transaction ${existingPending._id} is missing paymentUrl. Discarding to regenerate.`);
        await PaymentTransaction.deleteOne({ _id: existingPending._id });
        existingPending = null;
      }
    }

    if (existingPending) {
      console.log(`[Duplicate Prevention] Reusing existing pending transaction: ${existingPending._id} for user ${user._id}, provider: ${existingPending.provider}, amount: ${existingPending.amount}`);
      let rzpKeyId: string | undefined;
      if (existingPending.provider === 'razorpay') {
        const config = await PaymentConfig.findOne({ key: 'default' }).lean();
        rzpKeyId = config?.providers?.razorpay?.keyId || '';
      }
      // Return the existing order's payment session / payment URL
      return successResponse({
        orderId: existingPending.cashfreeOrderId,
        paymentSessionId: existingPending.paymentSessionId,
        paymentUrl: (existingPending as any).paymentUrl || '',
        amount: existingPending.amount,
        type,
        existing: true,
        provider: existingPending.provider || 'cashfree',
        razorpayKeyId: rzpKeyId,
      }, 'Existing payment order found');
    }

    // Generate unique order ID
    const orderId = generateOrderId(user._id.toString(), type);

    // Cashfree/PhonePe Production requires HTTPS URLs
    let returnUrl = user.role === 'member'
      ? `${BASE_URL}/member/receipt?order_id=${orderId}&type=${type}`
      : `${BASE_URL}/payment-pending?order_id=${orderId}&type=${type}`;
    let notifyUrl = `${BASE_URL}/api/payment/webhook`;
    
    // Production requires HTTPS URLs for return and notify endpoints
    if (!returnUrl.includes('localhost')) {
      returnUrl = returnUrl.replace('http://', 'https://');
    }
    if (!notifyUrl.includes('localhost')) {
      notifyUrl = notifyUrl.replace('http://', 'https://');
    }
    
    console.log(`[Transaction Creation] Creating new order with provider: ${provider.name}, orderId: ${orderId}, amount: ${amount}`);

    const orderResult = await provider.createOrder({
      orderId,
      orderAmount: amount,
      customerName: user.fullName,
      customerPhone: user.mobile,
      customerEmail: user.email,
      returnUrl,
      notifyUrl,
    });

    console.log(`[Transaction Creation] Order created at gateway. gatewayOrderId: ${orderResult.gatewayOrderId}, paymentUrl: ${orderResult.paymentUrl}`);

    // Save transaction record with provider info
    const newTxn = await PaymentTransaction.create({
      userId: user._id,
      type,
      role: user.role,
      amount,
      status: 'created',
      provider: provider.name,
      cashfreeOrderId: orderId, // Still saving for backward compatibility, though it acts as a generic orderId now
      gatewayOrderId: orderResult.gatewayOrderId,
      paymentSessionId: orderResult.paymentSessionId || '',
      paymentUrl: orderResult.paymentUrl || '',
    });

    console.log(`[Transaction Creation Result] Created database transaction ID: ${newTxn._id}`);

    return successResponse({
      orderId,
      paymentSessionId: orderResult.paymentSessionId,
      paymentUrl: orderResult.paymentUrl, // PhonePe returns paymentUrl
      amount,
      type,
      provider: provider.name,
      razorpayKeyId: orderResult.razorpayKeyId,
    }, 'Payment order created successfully');
  } catch (error: any) {
    console.error('Create Payment Order Error:', error);
    return errorResponse(error.message || 'Failed to create payment order', 500);
  }
}
