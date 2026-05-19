import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import PaymentTransaction from '@/models/PaymentTransaction';
import Membership from '@/models/Membership';
import WalletTransaction from '@/models/WalletTransaction';
import Wallet from '@/models/Wallet';
import User from '@/models/User';
import { syncWalletBalance } from '@/lib/commission';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Admin access required.', 401);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);

    // Read Filter Parameters
    const roleFilter = searchParams.get('role'); // vendor, sub_vendor, employee
    const userSearch = searchParams.get('user'); // name, mobile, or code
    const typeFilter = searchParams.get('paymentType'); // subscription, deposit, membership
    const statusFilter = searchParams.get('status'); // paid, pending, failed
    const districtFilter = searchParams.get('district');
    const blockFilter = searchParams.get('block');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');

    // 1. Calculate General System Statistics
    // Platform Revenue (PaymentTransaction paid)
    const paidTransactions = await PaymentTransaction.find({ status: 'paid' });
    let subscriptionRevenue = 0;
    let depositRevenue = 0;
    paidTransactions.forEach(t => {
      if (t.type === 'subscription') subscriptionRevenue += t.amount;
      if (t.type === 'deposit') depositRevenue += t.amount;
    });

    // Membership Revenue (Membership Paid)
    const paidMemberships = await Membership.find({ paymentStatus: 'Paid' });
    let membershipRevenue = 0;
    paidMemberships.forEach(m => {
      membershipRevenue += m.amount;
    });

    const totalRevenue = subscriptionRevenue + depositRevenue + membershipRevenue;

    // Commission Stats
    const walletCredits = await WalletTransaction.find({ type: 'credit' });
    let commissionDistributed = 0;
    let commissionPending = 0;
    walletCredits.forEach(c => {
      if (['commission_subscription', 'commission_deposit', 'commission_member'].includes(c.category)) {
        if (c.status === 'completed') commissionDistributed += c.amount;
        if (c.status === 'pending') commissionPending += c.amount;
      }
    });

    // Withdrawal Stats
    const walletDebits = await WalletTransaction.find({ type: 'debit', category: 'withdrawal' });
    let withdrawalsCompleted = 0;
    let withdrawalsPending = 0;
    walletDebits.forEach(d => {
      if (d.status === 'completed') withdrawalsCompleted += d.amount;
      if (d.status === 'pending') withdrawalsPending += d.amount;
    });

    const netIncome = totalRevenue - commissionDistributed - withdrawalsCompleted;

    // 2. Fetch User Network and Wallets list
    const wallets = await Wallet.find()
      .populate('userId', 'fullName role mobile vendorCode subVendorCode status district block')
      .sort({ balance: -1 });

    // 3. Compile audit logs & transaction records with filters
    // Build query objects
    let ptQuery: any = { status: 'paid' };
    let msQuery: any = { paymentStatus: 'Paid' };
    let wtQuery: any = {};

    // Date filters
    if (dateStart || dateEnd) {
      const dateRange: any = {};
      if (dateStart) dateRange.$gte = new Date(dateStart);
      if (dateEnd) dateRange.$lte = new Date(dateEnd);

      ptQuery.createdAt = dateRange;
      msQuery.createdAt = dateRange;
      wtQuery.createdAt = dateRange;
    }

    // Role & user filters require user ID resolution
    let matchedUserIds: mongoose.Types.ObjectId[] = [];
    let isUserFilterActive = false;

    if (roleFilter || userSearch || districtFilter || blockFilter) {
      isUserFilterActive = true;
      const uQuery: any = {};
      if (roleFilter) uQuery.role = roleFilter;
      if (districtFilter) uQuery.district = new RegExp(districtFilter, 'i');
      if (blockFilter) uQuery.block = new RegExp(blockFilter, 'i');

      if (userSearch) {
        uQuery.$or = [
          { fullName: new RegExp(userSearch, 'i') },
          { mobile: new RegExp(userSearch, 'i') },
          { vendorCode: new RegExp(userSearch, 'i') },
          { subVendorCode: new RegExp(userSearch, 'i') },
          { employeeId: new RegExp(userSearch, 'i') }
        ];
      }

      const matchedUsers = await User.find(uQuery).select('_id');
      matchedUserIds = matchedUsers.map(u => u._id);
    }

    if (isUserFilterActive) {
      ptQuery.userId = { $in: matchedUserIds };
      msQuery.employeeId = { $in: matchedUserIds };
      wtQuery.userId = { $in: matchedUserIds };
    }

    // Status filter
    if (statusFilter) {
      wtQuery.status = statusFilter;
    }

    // Query records
    let paymentsList: any[] = [];

    // Subscription & Deposit list
    if (!typeFilter || typeFilter === 'subscription' || typeFilter === 'deposit') {
      if (typeFilter) ptQuery.type = typeFilter;
      const pts = await PaymentTransaction.find(ptQuery)
        .populate('userId', 'fullName role mobile state district block')
        .sort({ createdAt: -1 });

      pts.forEach(p => {
        paymentsList.push({
          id: p._id,
          date: p.paidAt || p.createdAt,
          user: p.userId,
          amount: p.amount,
          type: p.type === 'subscription' ? 'Platform Subscription' : 'Security Deposit',
          method: p.paymentMethod || 'Gateway',
          referenceId: p.cashfreeOrderId || 'N/A',
          status: p.status
        });
      });
    }

    // Memberships list
    if (!typeFilter || typeFilter === 'membership') {
      const mss = await Membership.find(msQuery)
        .populate('employeeId', 'fullName role mobile state district block')
        .populate('memberId', 'name mobile district block')
        .sort({ createdAt: -1 });

      mss.forEach(m => {
        paymentsList.push({
          id: m._id,
          date: m.paymentDate || m.createdAt,
          user: m.employeeId,
          amount: m.amount,
          type: 'Member Registration',
          method: m.paymentMode || 'Online',
          referenceId: m.membershipId || m.receiptNumber || 'N/A',
          status: m.paymentStatus.toLowerCase(),
          details: `Registered: ${(m.memberId as any)?.name || 'Member'}`
        });
      });
    }

    // Sort combined paymentsList by date descending
    paymentsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Wallet Transactions list (Ledger / Audit Trails)
    const walletTxns = await WalletTransaction.find(wtQuery)
      .populate('userId', 'fullName role mobile')
      .populate('sourceUserId', 'fullName role')
      .sort({ createdAt: -1 });

    const unifiedLedger: any[] = [];

    // 1. Map Wallet Transactions
    walletTxns.forEach(txn => {
      let lCat = 'commission_split';
      let accClass = 'commission';
      
      if (txn.category === 'withdrawal') {
        lCat = 'payout';
        accClass = 'payout';
      } else if (txn.category === 'refund') {
        lCat = 'reversal';
        accClass = 'reversal';
      } else if (txn.category === 'adjustment') {
        lCat = 'adjustment';
        accClass = 'adjustment';
      }

      unifiedLedger.push({
        _id: txn._id,
        date: txn.createdAt,
        ledgerCategory: lCat,
        category: txn.category,
        amount: txn.amount,
        type: txn.type, // 'credit' (add to wallet) or 'debit' (deduct from wallet)
        description: txn.description,
        referenceId: txn.referenceId || 'N/A',
        status: txn.status,
        userId: txn.userId, // Impacted user wallet
        sourceUserId: txn.sourceUserId,
        sourceUserFullName: txn.sourceUserFullName,
        sourceUserRole: txn.sourceUserRole,
        sourceAmount: txn.sourceAmount,
        bankDetails: txn.bankDetails,
        impactedAccount: 'wallet',
        accountingClass: accClass
      });
    });

    // 2. Map Payment Transactions into the Ledger if not filtered out by specific filters
    if (!statusFilter || statusFilter === 'completed') {
      // Subscription & Deposit
      if (!typeFilter || typeFilter === 'subscription' || typeFilter === 'deposit') {
        const ptQueryLedger = { ...ptQuery };
        const pts = await PaymentTransaction.find(ptQueryLedger)
          .populate('userId', 'fullName role mobile state district block')
          .sort({ createdAt: -1 });

        pts.forEach(p => {
          unifiedLedger.push({
            _id: p._id,
            date: p.paidAt || p.createdAt,
            ledgerCategory: 'payment',
            category: p.type, // 'subscription' or 'deposit'
            amount: p.amount,
            type: 'credit', // inbound credit to the platform
            description: p.type === 'subscription' ? 'Inbound Platform Subscription Fee' : 'Inbound Partner Security Deposit',
            referenceId: p.cashfreeOrderId || 'N/A',
            status: 'completed',
            userId: p.userId, // The user who paid
            sourceUserId: null,
            sourceUserFullName: p.userId?.fullName || 'Direct Walk-in',
            sourceUserRole: p.userId?.role,
            sourceAmount: p.amount,
            paymentMethod: p.paymentMethod || 'Gateway',
            impactedAccount: 'platform',
            accountingClass: 'revenue'
          });
        });
      }

      // Memberships
      if (!typeFilter || typeFilter === 'membership') {
        const msQueryLedger = { ...msQuery };
        const mss = await Membership.find(msQueryLedger)
          .populate('employeeId', 'fullName role mobile state district block')
          .populate('memberId', 'name mobile district block')
          .sort({ createdAt: -1 });

        mss.forEach(m => {
          unifiedLedger.push({
            _id: m._id,
            date: m.paymentDate || m.createdAt,
            ledgerCategory: 'payment',
            category: 'membership',
            amount: m.amount,
            type: 'credit', // inbound credit to the platform
            description: `Inbound Member Registration Fee (Registered: ${(m.memberId as any)?.name || 'Member'})`,
            referenceId: m.membershipId || m.receiptNumber || 'N/A',
            status: 'completed',
            userId: m.employeeId, // Registered by employee
            sourceUserId: m.memberId?._id,
            sourceUserFullName: (m.memberId as any)?.name || 'Member',
            sourceUserRole: 'member',
            sourceAmount: m.amount,
            paymentMethod: m.paymentMode || 'Online',
            impactedAccount: 'platform',
            accountingClass: 'revenue'
          });
        });
      }
    }

    // Sort unifiedLedger by date descending
    unifiedLedger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return successResponse({
      stats: {
        totalRevenue,
        subscriptionRevenue,
        depositRevenue,
        membershipRevenue,
        commissionDistributed,
        commissionPending,
        withdrawalsCompleted,
        withdrawalsPending,
        netIncome
      },
      wallets,
      paymentsList,
      ledger: unifiedLedger
    }, 'Finance metrics fetched successfully');
  } catch (error: any) {
    console.error('Admin Finance GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch financial data', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Admin access required.', 401);
    }

    await dbConnect();
    const { transactionId, action, remarks } = await req.json();

    if (!transactionId) return errorResponse('Transaction ID is required', 400);
    if (!['approve', 'reject'].includes(action)) return errorResponse('Invalid action. Must be approve or reject.', 400);

    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction) return errorResponse('Transaction ledger entry not found', 404);

    if (transaction.type !== 'debit' || transaction.category !== 'withdrawal') {
      return errorResponse('Only withdrawal debit transactions can be processed via this pipeline', 400);
    }

    if (transaction.status !== 'pending') {
      return errorResponse(`Transaction is already processed with status: ${transaction.status}`, 400);
    }

    if (action === 'approve') {
      transaction.status = 'completed';
      if (transaction.bankDetails) {
        transaction.bankDetails.remarks = remarks || 'Approved & Settled by Administrator';
      }
      await transaction.save();
    } else {
      transaction.status = 'cancelled'; // cancelled releases locked balance
      if (transaction.bankDetails) {
        transaction.bankDetails.remarks = remarks || 'Rejected by Administrator';
      }
      await transaction.save();
    }

    // Mathematical re-sync of user's wallet
    const updatedWallet = await syncWalletBalance(transaction.userId);

    return successResponse({
      transaction,
      wallet: updatedWallet
    }, `Withdrawal request successfully ${action}d`);
  } catch (error: any) {
    console.error('Admin Payout Approval PATCH Error:', error);
    return errorResponse(error.message || 'Failed to process payout action', 500);
  }
}
