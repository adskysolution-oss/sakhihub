import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import { isCashfreeConfigured } from '@/lib/cashfree';
import PaymentTransaction from '@/models/PaymentTransaction';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const sessionUser = session as any;

    const user = await User.findById(sessionUser.id).select('role subscriptionPaid depositPaid paymentCompleted documentsVerified fullName mobile email');
    if (!user) return errorResponse('User not found', 404);

    if (!['vendor', 'sub_vendor', 'employee'].includes(user.role)) {
      return successResponse({
        paymentRequired: false,
        paymentCompleted: true,
      }, 'Payment not applicable for this role');
    }

    const roleKey = user.role as 'vendor' | 'sub_vendor' | 'employee';

    // Get payment config
    let config = await PaymentConfig.findOne({ key: 'default' });
    if (!config) {
      config = await PaymentConfig.create({
        key: 'default',
        subscriptionAmount: { vendor: 5000, sub_vendor: 3000, employee: 1000 },
        depositAmount: { vendor: 10000, sub_vendor: 5000, employee: 2000 },
        paymentRequired: { vendor: true, sub_vendor: true, employee: true },
        subscriptionRequired: { vendor: true, sub_vendor: true, employee: true },
        depositRequired: { vendor: true, sub_vendor: true, employee: true },
      });
    }

    const paymentEnabled = config.paymentRequired[roleKey];
    const subRequired = paymentEnabled && config.subscriptionRequired[roleKey];
    const depRequired = paymentEnabled && config.depositRequired[roleKey];

    // Auto-complete payment if requirements are met or disabled
    const isSubMet = !subRequired || user.subscriptionPaid;
    const isDepMet = !depRequired || user.depositPaid;

    if (isSubMet && isDepMet && !user.paymentCompleted) {
      await User.findByIdAndUpdate(user._id, { paymentCompleted: true });
      user.paymentCompleted = true; // Update local state for response
    }

    // Fetch transaction history for this user
    const transactions = await PaymentTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return successResponse({
      paymentRequired: paymentEnabled,
      subscription: {
        required: subRequired,
        amount: config.subscriptionAmount[roleKey],
        paid: user.subscriptionPaid,
      },
      deposit: {
        required: depRequired,
        amount: config.depositAmount[roleKey],
        paid: user.depositPaid,
      },
      paymentCompleted: user.paymentCompleted,
      documentsVerified: user.documentsVerified,
      isCashfreeConfigured: isCashfreeConfigured(),
      cashfreeEnv: 'production',
      transactions,
    }, 'Payment status retrieved');
  } catch (error: any) {
    console.error('Payment Status Error:', error);
    return errorResponse(error.message || 'Failed to fetch payment status', 500);
  }
}
