import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession, signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import PaymentTransaction from '@/models/PaymentTransaction';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const { userId, type, action } = await req.json();

    if (!userId) return errorResponse('User ID is required', 400);
    if (!type && action !== 'complete_all') return errorResponse('Payment type is required (subscription or deposit)', 400);

    const user = await User.findById(userId);
    if (!user) return errorResponse('User not found', 404);

    if (!['vendor', 'sub_vendor', 'employee'].includes(user.role)) {
      return errorResponse('Payment override is only available for Vendor, Sub-Vendor, and Employee roles', 400);
    }

    if (action === 'complete_all') {
      user.subscriptionPaid = true;
      user.depositPaid = true;
      user.paymentCompleted = true;

      // Auto-grant access if docs are verified
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

      await user.save();

      // Create admin override transaction records
      for (const t of ['subscription', 'deposit']) {
        const existing = await PaymentTransaction.findOne({ userId: user._id, type: t, status: 'paid' });
        if (!existing) {
          await PaymentTransaction.create({
            userId: user._id,
            type: t,
            role: user.role,
            amount: 0,
            status: 'paid',
            cashfreeOrderId: `ADMIN_OVERRIDE_${user._id}_${t}_${Date.now()}`,
            paymentMethod: 'admin_override',
            paidAt: new Date(),
            gatewayResponse: { overriddenBy: (session as any).id, reason: 'Admin manual override' },
          });
        }
      }

      return successResponse(user, 'All payments marked as complete');
    }

    // Single type override
    if (type === 'subscription') {
      user.subscriptionPaid = true;
    } else if (type === 'deposit') {
      user.depositPaid = true;
    } else {
      return errorResponse('Invalid type. Must be "subscription" or "deposit"', 400);
    }

    // Check if all payments are now complete
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

    // Create admin override transaction record
    const existing = await PaymentTransaction.findOne({ userId: user._id, type, status: 'paid' });
    if (!existing) {
      await PaymentTransaction.create({
        userId: user._id,
        type,
        role: user.role,
        amount: 0,
        status: 'paid',
        cashfreeOrderId: `ADMIN_OVERRIDE_${user._id}_${type}_${Date.now()}`,
        paymentMethod: 'admin_override',
        paidAt: new Date(),
        gatewayResponse: { overriddenBy: (session as any).id, reason: 'Admin manual override' },
      });
    }

    return successResponse(user, `${type} payment marked as complete`);
  } catch (error: any) {
    console.error('Payment Override Error:', error);
    return errorResponse(error.message || 'Failed to override payment', 500);
  }
}
