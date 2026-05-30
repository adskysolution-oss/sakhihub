import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession, signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import PaymentTransaction from '@/models/PaymentTransaction';
import { PaymentResolver } from '@/lib/payments/PaymentResolver';
import { distributeCommission } from '@/lib/commission';

import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import { notifyMembershipPayment } from '@/lib/notifications';

/**
 * Check if all required payments are completed for a user and update flags accordingly.
 * Returns true if paymentCompleted was set to true.
 */
async function checkAndUpdatePaymentCompletion(userId: string): Promise<boolean> {
  const user = await User.findById(userId);
  if (!user) return false;

  const roleKey = user.role as 'vendor' | 'sub_vendor' | 'employee';
  let config = await PaymentConfig.findOne({ key: 'default' });

  if (!config) {
    // No config means no payment required
    user.paymentCompleted = true;
    user.subscriptionPaid = true;
    user.depositPaid = true;
    await user.save();
    return true;
  }

  // Check if payments are required for this role
  const subRequired = config.subscriptionRequired[roleKey];
  const depRequired = config.depositRequired[roleKey];

  const subPaid = user.subscriptionPaid || !subRequired;
  const depPaid = user.depositPaid || !depRequired;

  if (subPaid && depPaid) {
    user.paymentCompleted = true;

    // If docs verified + payment done + (for vendor, or assignment completed for others) => grant dashboard access
    if (user.documentsVerified) {
      if (user.role === 'vendor') {
        user.dashboardAccess = true;
        user.onboardingCompleted = true;
        user.status = 'active';
      }
      // For sub_vendor and employee, dashboardAccess also depends on assignmentStatus
      if (['sub_vendor', 'employee'].includes(user.role) && user.assignmentStatus === 'completed') {
        user.dashboardAccess = true;
        user.onboardingCompleted = true;
        user.status = 'active';
      }
    }

    await user.save();
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { orderId } = await req.json();
    if (!orderId) return errorResponse('Order ID is required', 400);

    await dbConnect();

    const sessionUser = session as any;

    // Find the transaction
    const transaction = await PaymentTransaction.findOne({
      $or: [
        { cashfreeOrderId: orderId },
        { gatewayOrderId: orderId }
      ],
      userId: sessionUser.id,
    });

    if (!transaction) return errorResponse('Transaction not found', 404);

    // If already paid, just return success
    if (transaction.status === 'paid') {
      return successResponse({ status: 'paid', type: transaction.type }, 'Payment already verified');
    }

    // Resolve the appropriate provider
    const providerName = transaction.provider || 'cashfree';
    const provider = await PaymentResolver.resolveProviderByName(providerName);

    // Verify with the provider
    const verification = await provider.verifyPayment({
      gatewayOrderId: transaction.gatewayOrderId || transaction.cashfreeOrderId,
    });
    
    if (verification.success && verification.status === 'PAYMENT_SUCCESS') {
      // Update transaction
      transaction.status = 'paid';
      transaction.paidAt = new Date();
      transaction.gatewayResponse = verification;
      transaction.gatewayPaymentId = verification.gatewayPaymentId;
      await transaction.save();

      // Trigger upline commission distribution
      try {
        await distributeCommission(
          transaction.userId,
          transaction.type as 'subscription' | 'deposit',
          transaction.amount,
          transaction.cashfreeOrderId
        );
      } catch (err) {
        console.error('[Commission Error] Failed to distribute commission in verify:', err);
      }

      // Update user payment flags
      const user = await User.findById(sessionUser.id);
      if (user) {
        let completed = false;

        if (user.role === 'member') {
          user.subscriptionPaid = true;
          user.paymentCompleted = true;
          user.status = 'active';
          user.dashboardAccess = true;
          user.onboardingCompleted = true;
          await user.save();
          completed = true;

          const member = await WomenMember.findOne({ userId: user._id });
          if (member) {
            member.membershipStatus = 'paid';
            member.accountStatus = 'active';
            await member.save();

            const existing = await Membership.findOne({ memberId: member._id });
            if (!existing) {
              const count = await Membership.countDocuments();
              const year = new Date().getFullYear();
              const ts = Date.now().toString().slice(-4);
              const membershipId = `SH-${year}-${1000 + count + 1}-${ts}`;
              const receiptNumber = `REC-${year}-${2000 + count + 1}-${ts}`;

              const membership = await Membership.create({
                membershipId,
                receiptNumber,
                memberId: member._id,
                groupId: member.groupId || null,
                employeeId: member.assignedEmployeeId || null,
                amount: transaction.amount,
                paymentMode: 'Online',
                paymentStatus: 'Paid',
                paymentDate: new Date(),
                cashfreeOrderId: orderId
              });

              try {
                await distributeCommission(member._id.toString(), 'membership', transaction.amount, membership.membershipId);
              } catch (err) {
                console.error('[Commission Error] Failed to distribute membership registration commission:', err);
              }

              try {
                notifyMembershipPayment(membership._id.toString());
              } catch (err) {
                console.error('Failed to notify membership payment', err);
              }
            }
          }
        } else {
          if (transaction.type === 'subscription') user.subscriptionPaid = true;
          if (transaction.type === 'deposit') user.depositPaid = true;
          await user.save();

          // Check if all payments are now complete
          completed = await checkAndUpdatePaymentCompletion(sessionUser.id);
        }

        // Refresh JWT token with updated payment status
        const updatedUser = await User.findById(sessionUser.id);
        if (updatedUser) {
          const newToken = signToken({
            id: updatedUser._id,
            role: updatedUser.role,
            status: updatedUser.status,
            assignmentStatus: updatedUser.assignmentStatus,
            fullName: updatedUser.fullName,
            mobile: updatedUser.mobile,
            isVerified: updatedUser.isVerified,
            onboardingCompleted: updatedUser.onboardingCompleted,
            documentsVerified: updatedUser.documentsVerified,
            dashboardAccess: updatedUser.dashboardAccess,
            paymentCompleted: updatedUser.paymentCompleted,
          });
          await setAuthCookie(newToken);
        }

        return successResponse({
          status: 'paid',
          type: transaction.type,
          paymentCompleted: completed,
          dashboardAccess: updatedUser?.dashboardAccess || false,
        }, 'Payment verified successfully');
      }
    } else if (['EXPIRED', 'CANCELLED', 'VOID', 'FAILED'].includes(verification.status)) {
      transaction.status = 'failed';
      transaction.failureReason = verification.status;
      transaction.gatewayResponse = verification;
      await transaction.save();

      return successResponse({
        status: 'failed',
        type: transaction.type,
        reason: verification.status,
      }, 'Payment failed or expired');
    } else {
      // Still pending
      transaction.status = 'pending';
      transaction.gatewayResponse = verification;
      await transaction.save();

      return successResponse({
        status: 'pending',
        type: transaction.type,
      }, 'Payment is still being processed');
    }

    return successResponse({ status: transaction.status, type: transaction.type });
  } catch (error: any) {
    console.error('Verify Payment Error:', error);
    return errorResponse(error.message || 'Failed to verify payment', 500);
  }
}

export { checkAndUpdatePaymentCompletion };
