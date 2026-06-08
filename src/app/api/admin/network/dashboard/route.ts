import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import SecurityDeposit from '@/models/SecurityDeposit';
import ManualPaymentRequest from '@/models/ManualPaymentRequest';
import PaymentTransaction from '@/models/PaymentTransaction';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // 1. Core Counts
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const totalSubVendors = await User.countDocuments({ role: 'sub_vendor' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalMembers = await WomenMember.countDocuments({ accountStatus: 'active' });

    // Active vs Pending
    const activeUsers = await User.countDocuments({ status: 'active' });
    const activeMembers = await WomenMember.countDocuments({ accountStatus: 'active' });
    const totalActive = activeUsers + activeMembers;

    const pendingUsers = await User.countDocuments({
      status: { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] }
    });
    const pendingMembers = await WomenMember.countDocuments({ connectionStatus: 'pending_request' });
    const totalPending = pendingUsers + pendingMembers;

    // 2. Financial Collections
    const membershipPaid = await Membership.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const depositPaid = await SecurityDeposit.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);
    const subPaid = await ManualPaymentRequest.aggregate([
      { $match: { type: 'subscription', status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const onlineDepositPaid = await PaymentTransaction.aggregate([
      { $match: { type: 'deposit', status: { $in: ['paid', 'completed', 'success'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const onlineSubPaid = await PaymentTransaction.aggregate([
      { $match: { type: 'subscription', status: { $in: ['paid', 'completed', 'success'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPaidCollections =
      (membershipPaid[0]?.total || 0) +
      (depositPaid[0]?.total || 0) + (onlineDepositPaid[0]?.total || 0) +
      (subPaid[0]?.total || 0) + (onlineSubPaid[0]?.total || 0);

    // 3. Growth metrics (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const growthMembers = await WomenMember.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const growthEmployees = await User.countDocuments({ role: 'employee', createdAt: { $gte: thirtyDaysAgo } });
    const growthSubVendors = await User.countDocuments({ role: 'sub_vendor', createdAt: { $gte: thirtyDaysAgo } });
    const growthVendors = await User.countDocuments({ role: 'vendor', createdAt: { $gte: thirtyDaysAgo } });

    const recentGrowth = growthMembers + growthEmployees + growthSubVendors + growthVendors;

    // 4. Recent Activity (Last 5 creations)
    const recentCreations = await User.find()
      .select('fullName role createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = recentCreations.map((c: any) => ({
      name: c.fullName,
      role: c.role,
      action: `registered on the platform`,
      time: c.createdAt
    }));

    return successResponse({
      counts: {
        vendors: totalVendors,
        subVendors: totalSubVendors,
        employees: totalEmployees,
        members: totalMembers
      },
      status: {
        active: totalActive,
        pending: totalPending
      },
      collections: {
        total: totalPaidCollections,
        membership: membershipPaid[0]?.total || 0,
        deposit: (depositPaid[0]?.total || 0) + (onlineDepositPaid[0]?.total || 0),
        subscription: (subPaid[0]?.total || 0) + (onlineSubPaid[0]?.total || 0)
      },
      growth: {
        total: recentGrowth,
        members: growthMembers,
        employees: growthEmployees,
        subVendors: growthSubVendors,
        vendors: growthVendors
      },
      recentActivity
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    return errorResponse(error.message, 500);
  }
}
