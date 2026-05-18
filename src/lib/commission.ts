import mongoose from 'mongoose';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import WalletTransaction, { WalletTxnCategory, WalletTxnStatus } from '@/models/WalletTransaction';
import WomenMember from '@/models/WomenMember';
import CommissionConfig from '@/models/CommissionConfig';

/**
 * Mathematically synchronizes a user's Wallet balances from their WalletTransactions.
 * This ensures absolute consistency and prevents double-spending or stale records.
 */
export async function syncWalletBalance(userId: string | mongoose.Types.ObjectId): Promise<any> {
  const userObjectId = new mongoose.Types.ObjectId(userId.toString());

  // Ensure a Wallet document exists for this user
  let wallet = await Wallet.findOne({ userId: userObjectId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId: userObjectId,
      balance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      totalWithdrawn: 0,
      commissionEarned: 0,
      commissionPending: 0
    });
  }

  // Aggregate credit transactions
  const creditAgg = await WalletTransaction.aggregate([
    { $match: { userId: userObjectId, type: 'credit' } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        commission: {
          $sum: {
            $cond: [
              { $in: ['$category', ['commission_subscription', 'commission_deposit', 'commission_member']] },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ]);

  // Aggregate debit transactions
  const debitAgg = await WalletTransaction.aggregate([
    { $match: { userId: userObjectId, type: 'debit' } },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        withdrawn: {
          $sum: {
            $cond: [
              { $eq: ['$category', 'withdrawal'] },
              '$amount',
              0
            ]
          }
        }
      }
    }
  ]);

  // Extract counts
  let completedCredits = 0;
  let pendingCredits = 0;
  let commissionEarned = 0;
  let commissionPending = 0;

  creditAgg.forEach(group => {
    if (group._id === 'completed') {
      completedCredits = group.total;
      commissionEarned = group.commission;
    } else if (group._id === 'pending') {
      pendingCredits = group.total;
      commissionPending = group.commission;
    }
  });

  let allDebits = 0; // pending or completed debits deduct from available balance immediately
  let completedDebits = 0;
  let pendingDebits = 0;
  let totalWithdrawn = 0;

  debitAgg.forEach(group => {
    if (group._id === 'completed') {
      completedDebits = group.total;
      allDebits += group.total;
      totalWithdrawn = group.withdrawn;
    } else if (group._id === 'pending') {
      pendingDebits = group.total;
      allDebits += group.total; // pending withdrawal locks balance
    }
  });

  // Calculate final wallet values
  // balance: Completed credits minus all pending/completed debits (locks pending withdrawals)
  wallet.balance = Math.max(0, completedCredits - allDebits);
  
  // pendingBalance: Pending commissions (credits) + pending withdrawal requests (debits)
  wallet.pendingBalance = pendingCredits + pendingDebits;

  wallet.lifetimeEarnings = commissionEarned;
  wallet.commissionEarned = commissionEarned;
  wallet.commissionPending = commissionPending;
  wallet.totalWithdrawn = totalWithdrawn;

  await wallet.save();
  return wallet;
}

/**
 * Distributes tiered, hierarchical commissions for platform actions.
 * Supports:
 * - 'subscription' or 'deposit': Direct parent gets 10%, grandparent gets 5%
 * - 'membership': Tiered fixed amounts (recruiter: 20, parent: 10, grandparent: 5)
 */
export async function distributeCommission(
  sourceUserId: string | mongoose.Types.ObjectId,
  paymentType: 'subscription' | 'deposit' | 'membership',
  totalAmount: number,
  referenceId: string
): Promise<boolean> {
  try {
    const sourceObjId = new mongoose.Types.ObjectId(sourceUserId.toString());
    console.log(`[Commission Engine] Triggered for sourceUser: ${sourceObjId}, type: ${paymentType}, amount: ${totalAmount}`);

    // Prevent duplicate processing of the same referenceId and paymentType
    const duplicate = await WalletTransaction.findOne({ referenceId, category: `commission_${paymentType}` as any });
    if (duplicate) {
      console.log(`[Commission Engine] Commission already distributed for referenceId: ${referenceId}`);
      return false;
    }

    // Fetch or seed default configurations dynamically
    let config = await CommissionConfig.findOne({ key: 'default' });
    if (!config) {
      config = await CommissionConfig.create({ key: 'default' });
    }

    if (paymentType === 'membership') {
      // Find Member and trace recruiter/employee
      const member = await WomenMember.findOne({
        $or: [{ userId: sourceObjId }, { _id: sourceObjId }]
      });

      if (!member) {
        console.warn(`[Commission Engine] WomenMember not found for sourceId: ${sourceObjId}`);
        return false;
      }

      const recruiterId = member.assignedEmployeeId || member.createdBy;
      if (!recruiterId) {
        console.warn(`[Commission Engine] No recruiter assigned for member: ${member._id}`);
        return false;
      }

      const recruiter = await User.findById(recruiterId);
      if (!recruiter) {
        console.warn(`[Commission Engine] Recruiter User not found: ${recruiterId}`);
        return false;
      }

      // Tier 1: Recruiter Direct Commission & Tiers (Percentage based)
      let recruiterCommissionPct = 20;
      let parentCommissionPct = 10;
      let grandparentCommissionPct = 5;

      const memConfig = config.memberCommission;
      if (recruiter.role === 'employee') {
        recruiterCommissionPct = memConfig.employeeRecruiter;
        parentCommissionPct = memConfig.subVendorParent;
      } else if (recruiter.role === 'sub_vendor') {
        recruiterCommissionPct = memConfig.subVendorRecruiter;
        parentCommissionPct = memConfig.vendorParentDirect;
      } else if (recruiter.role === 'vendor') {
        recruiterCommissionPct = memConfig.vendorRecruiter;
        parentCommissionPct = 0;
      }
      grandparentCommissionPct = memConfig.vendorGrandparent;

      // Dynamically calculate actual commission amounts based on configured percentages
      const recruiterCommission = Math.round(totalAmount * (recruiterCommissionPct / 100));
      const parentCommission = Math.round(totalAmount * (parentCommissionPct / 100));
      const grandparentCommission = Math.round(totalAmount * (grandparentCommissionPct / 100));

      // 1. Credit Recruiter
      await creditCommissionWallet(
        recruiter._id,
        recruiterCommission,
        'commission_member',
        `Membership registration commission for downline ${member.name}`,
        sourceObjId,
        member.name,
        recruiter.role,
        totalAmount,
        referenceId
      );

      // 2. Credit Direct Parent (if exists)
      if (recruiter.parentVendorId && parentCommission > 0) {
        const parent = await User.findById(recruiter.parentVendorId);
        if (parent) {
          await creditCommissionWallet(
            parent._id,
            parentCommission,
            'commission_member',
            `Indirect member commission (Tier 2) for ${member.name} under ${recruiter.fullName}`,
            sourceObjId,
            member.name,
            recruiter.role,
            totalAmount,
            referenceId
          );

          // 3. Credit Grandparent (if exists and parent was a sub-vendor)
          if (parent.role === 'sub_vendor' && parent.parentVendorId && grandparentCommission > 0) {
            const grandparent = await User.findById(parent.parentVendorId);
            if (grandparent && grandparent.role === 'vendor') {
              await creditCommissionWallet(
                grandparent._id,
                grandparentCommission,
                'commission_member',
                `Indirect member commission (Tier 3) for ${member.name} registered under ${recruiter.fullName}`,
                sourceObjId,
                member.name,
                recruiter.role,
                totalAmount,
                referenceId
              );
            }
          }
        }
      }
    } else {
      // Platform Subscriptions / Deposits
      const sourceUser = await User.findById(sourceObjId);
      if (!sourceUser) {
        console.warn(`[Commission Engine] Source User not found: ${sourceObjId}`);
        return false;
      }

      if (!sourceUser.parentVendorId) {
        console.log(`[Commission Engine] Source user ${sourceUser.fullName} has no parent. Skip commission.`);
        return true;
      }

      // Direct Parent gets dynamic percentage
      const parent = await User.findById(sourceUser.parentVendorId);
      if (parent) {
        let parentPct = 10;
        let grandparentPct = 5;

        const subComm = config.subscriptionCommission;
        const depComm = config.depositCommission;

        if (parent.role === 'vendor') {
          parentPct = paymentType === 'subscription' ? subComm.vendorPct : depComm.vendorPct;
        } else if (parent.role === 'sub_vendor') {
          parentPct = paymentType === 'subscription' ? subComm.subVendorPct : depComm.subVendorPct;
        } else if (parent.role === 'employee') {
          parentPct = paymentType === 'subscription' ? subComm.employeePct : depComm.employeePct;
        }

        const directCommission = Math.round(totalAmount * (parentPct / 100));
        await creditCommissionWallet(
          parent._id,
          directCommission,
          paymentType === 'subscription' ? 'commission_subscription' : 'commission_deposit',
          `Direct commission (${parentPct}%) for downline ${sourceUser.fullName}'s ${paymentType}`,
          sourceObjId,
          sourceUser.fullName,
          sourceUser.role,
          totalAmount,
          referenceId
        );

        // Grandparent gets dynamic percentage (if parent is sub-vendor)
        if (parent.role === 'sub_vendor' && parent.parentVendorId) {
          const grandparent = await User.findById(parent.parentVendorId);
          if (grandparent && grandparent.role === 'vendor') {
            const vendorFullPct = paymentType === 'subscription' ? subComm.vendorPct : depComm.vendorPct;
            grandparentPct = Math.max(0, vendorFullPct - parentPct);
            if (grandparentPct === 0) grandparentPct = 5; // fallback 5%

            const indirectCommission = Math.round(totalAmount * (grandparentPct / 100));
            await creditCommissionWallet(
              grandparent._id,
              indirectCommission,
              paymentType === 'subscription' ? 'commission_subscription' : 'commission_deposit',
              `Indirect commission (${grandparentPct}%) for downline ${sourceUser.fullName}'s ${paymentType} through ${parent.fullName}`,
              sourceObjId,
              sourceUser.fullName,
              sourceUser.role,
              totalAmount,
              referenceId
            );
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('[Commission Engine] Distribution Failed:', error);
    return false;
  }
}

/**
 * Internal helper to credit a user's wallet and log a detailed transaction.
 */
async function creditCommissionWallet(
  userId: mongoose.Types.ObjectId,
  amount: number,
  category: WalletTxnCategory,
  description: string,
  sourceUserId: mongoose.Types.ObjectId,
  sourceUserFullName: string,
  sourceUserRole: string,
  sourceAmount: number,
  referenceId: string
) {
  // Ensure Wallet exists
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: 0,
      pendingBalance: 0,
      lifetimeEarnings: 0,
      totalWithdrawn: 0,
      commissionEarned: 0,
      commissionPending: 0
    });
  }

  // Create completed credit transaction
  await WalletTransaction.create({
    walletId: wallet._id,
    userId,
    type: 'credit',
    category,
    amount,
    status: 'completed', // Immediately active commission
    description,
    sourceUserId,
    sourceUserFullName,
    sourceUserRole,
    sourceAmount,
    referenceId
  });

  // Re-sync wallet balances
  await syncWalletBalance(userId);
}
