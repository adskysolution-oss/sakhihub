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
  let providerName = 'unknown';
  try {
    await dbConnect();

    const rawBody = await req.text();
    const headersObj: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });

    // Detect provider based on headers
    providerName = 'cashfree';
    if (headersObj['x-verify']) {
      providerName = 'phonepe';
    } else if (headersObj['x-razorpay-signature']) {
      providerName = 'razorpay';
    }

    console.log(`[Webhook Hit] Received webhook from provider: ${providerName}. Headers:`, JSON.stringify(headersObj));

    const provider = await PaymentResolver.resolveProviderByName(providerName);

    // Abstract webhook verification
    const verification = provider.verifyWebhook(rawBody, headersObj);

    if (!verification.isValid) {
      console.error(`[Webhook Verification Error] ${providerName} Webhook: Invalid signature`);
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }

    if (!verification.gatewayOrderId) {
      console.log(`[Webhook Event Handled] ${providerName} Webhook: Valid signature but no gatewayOrderId (unhandled event)`);
      return NextResponse.json({ success: true, message: 'Event type not handled' });
    }

    console.log(`[Webhook Hit] Verification success. Order/Reference ID matched: ${verification.gatewayOrderId}, status: ${verification.status}, amount: ${verification.amount}`);

    const transaction = await PaymentTransaction.findOne({
      $or: [
        { cashfreeOrderId: verification.gatewayOrderId },
        { gatewayOrderId: verification.gatewayOrderId }
      ]
    });

    if (!transaction) {
      console.error(`[Webhook Error] ${providerName} Webhook: Transaction not found in DB for order: ${verification.gatewayOrderId}`);
      return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    }

    console.log(`[Webhook Hit] Database transaction record matched. ID: ${transaction._id}, status: ${transaction.status}, amount: ${transaction.amount}`);

    // Already processed
    if (['paid', 'completed', 'success'].includes(transaction.status)) {
      console.log(`[Webhook Skip] Transaction ${transaction._id} is already processed with status: ${transaction.status}`);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    if (verification.status && ['SUCCESS', 'PAYMENT_SUCCESS', 'COMPLETED'].includes(verification.status)) {
      transaction.status = 'completed';
      transaction.paidAt = new Date();
      transaction.webhookReceived = true;
      transaction.gatewayResponse = JSON.parse(rawBody); // Store raw webhook data
      await transaction.save();

      console.log(`[Webhook DB Update Result] PaymentTransaction updated successfully. ID: ${transaction._id}, status: completed, webhookReceived: true`);

      // Trigger PAYMENT_SUCCESS notification for deposit payments
      if (transaction.type === 'deposit') {
        const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
        await NotificationService.trigger(NotificationEvent.PAYMENT_SUCCESS, { transactionId: transaction._id });
      }

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
        if (transaction.type === 'subscription') user.subscriptionPaid = true;
        if (transaction.type === 'deposit') user.depositPaid = true;
        await user.save();

        if (user.role === 'member') {
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
                cashfreeOrderId: verification.gatewayOrderId
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
        }

        // Call the centralized activation engine
        const { evaluateUserActivation } = await import('@/services/activationService');
        const activatedUser = await evaluateUserActivation(user._id);
        console.log(`[Webhook DB Update Result] User updated via Centralized Engine: ID: ${activatedUser._id}, role: ${activatedUser.role}, paymentCompleted: ${activatedUser.paymentCompleted}, status: ${activatedUser.status}, dashboardAccess: ${activatedUser.dashboardAccess}`);
      }
    } else if (verification.status && ['FAILED', 'CANCELLED', 'VOID'].includes(verification.status)) {
      transaction.status = 'failed';
      transaction.failureReason = verification.status;
      transaction.webhookReceived = true;
      transaction.gatewayResponse = JSON.parse(rawBody);
      await transaction.save();
      console.log(`[Webhook DB Update Result] PaymentTransaction marked failed: ID: ${transaction._id}, status: failed`);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    console.error(`[Webhook Error] ${providerName} Webhook Processing Failed:`, error);
    return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
  }
}
