import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PaymentConfig from '@/models/PaymentConfig';
import PaymentTransaction from '@/models/PaymentTransaction';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import { PaymentResolver } from '@/lib/payments/PaymentResolver';
import { distributeCommission } from '@/lib/commission';
import { notifyMembershipPayment } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const rawBody = await req.text();
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    // Detect provider based on headers
    const isPhonePe = !!headersObj['x-verify'];
    const providerName = isPhonePe ? 'phonepe' : 'cashfree';

    const provider = await PaymentResolver.resolveProviderByName(providerName);
    
    // Abstract webhook verification
    const verification = provider.verifyWebhook(rawBody, headersObj);

    if (!verification.isValid) {
      console.error(`${providerName} Webhook: Invalid signature`);
      // We don't block strictly for cashfree if not configured in legacy, but provider abstraction handles it
      // For now, if invalid, we return 401
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }

    if (!verification.gatewayOrderId) {
      // Valid signature but unhandled event type
      return NextResponse.json({ success: true, message: 'Event type not handled' });
    }

    const transaction = await PaymentTransaction.findOne({
      $or: [
        { cashfreeOrderId: verification.gatewayOrderId },
        { gatewayOrderId: verification.gatewayOrderId }
      ]
    });

    if (!transaction) {
      console.error(`${providerName} Webhook: Transaction not found for order`, verification.gatewayOrderId);
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    // Already processed
    if (transaction.status === 'paid') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    if (verification.status === 'SUCCESS' || verification.status === 'PAYMENT_SUCCESS') {
      transaction.status = 'paid';
      transaction.paidAt = new Date();
      transaction.webhookReceived = true;
      transaction.gatewayResponse = JSON.parse(rawBody); // Store raw webhook data
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
          console.error('[Commission Error] Failed to distribute commission in webhook:', err);
        }

        // Update user flags
        const user = await User.findById(transaction.userId);
        if (user) {
          if (user.role === 'member') {
            user.subscriptionPaid = true;
            user.paymentCompleted = true;
            user.status = 'active';
            user.dashboardAccess = true;
            user.onboardingCompleted = true;
            await user.save();

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

            // Check full payment completion (robust fallback if config not found)
            const roleKey = user.role as 'vendor' | 'sub_vendor' | 'employee';
            let config = await PaymentConfig.findOne({ key: 'default' });

            if (!config) {
              user.paymentCompleted = true;
              user.subscriptionPaid = true;
              user.depositPaid = true;
              if (user.documentsVerified) {
                if (user.role === 'vendor') {
                  user.dashboardAccess = true;
                  user.onboardingCompleted = true;
                  user.status = 'active';
                }
                if (['sub_vendor', 'employee'].includes(user.role) && user.assignmentStatus === 'completed') {
                  user.dashboardAccess = true;
                  user.onboardingCompleted = true;
                  user.status = 'active';
                }
              }
              await user.save();
            } else {
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
                    user.status = 'active';
                  }
                  if (['sub_vendor', 'employee'].includes(user.role) && user.assignmentStatus === 'completed') {
                    user.dashboardAccess = true;
                    user.onboardingCompleted = true;
                    user.status = 'active';
                  }
                }
                await user.save();
              }
            }
          }
        }
      } else if (['FAILED', 'CANCELLED', 'VOID'].includes(verification.status)) {
        transaction.status = 'failed';
        transaction.failureReason = verification.status;
        transaction.webhookReceived = true;
        transaction.gatewayResponse = JSON.parse(rawBody);
        await transaction.save();
      }

      return NextResponse.json({ success: true, message: 'Webhook processed' });
    } catch (error: any) {
    console.error('Cashfree Webhook Error:', error);
    return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
  }
}
