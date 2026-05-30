import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // Import models for stats
    const Group = (await import('@/models/Group')).default;
    const WomenMember = (await import('@/models/WomenMember')).default;
    const Membership = (await import('@/models/Membership')).default;
    const MemberRequest = (await import('@/models/MemberRequest')).default;

    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const activeEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
    const pendingEmployees = await User.countDocuments({ role: 'employee', status: 'pending' });
    const rejectedEmployees = await User.countDocuments({ role: 'employee', status: 'rejected' });

    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const activeVendors = await User.countDocuments({ role: 'vendor', status: 'active' });
    const totalSubVendors = await User.countDocuments({ role: 'sub_vendor' });
    const activeSubVendors = await User.countDocuments({ role: 'sub_vendor', status: 'active' });
    
    const totalMembers = await WomenMember.countDocuments();
    const unassignedMembers = await WomenMember.countDocuments({ connectionStatus: 'unassigned' });
    const pendingConnections = await MemberRequest.countDocuments({ status: 'pending' });
    const totalGroups = await Group.countDocuments();
    
    const collections = await Membership.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollections = collections[0]?.total || 0;

    // Aggregate Partner Subscriptions & Deposits from PaymentTransaction
    const PaymentTransaction = (await import('@/models/PaymentTransaction')).default;

    const partnerSubscriptionsAgg = await PaymentTransaction.aggregate([
      { $match: { type: 'subscription', status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPartnerSubscriptions = partnerSubscriptionsAgg[0]?.total || 0;

    const partnerDepositsAgg = await PaymentTransaction.aggregate([
      { $match: { type: 'deposit', status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPartnerDeposits = partnerDepositsAgg[0]?.total || 0;

    // Total Platform Revenue (Member Fees + Partner Subscriptions)
    const totalRevenue = totalCollections + totalPartnerSubscriptions;

    // District-wise collections
    const districtStats = await Membership.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupId',
          foreignField: '_id',
          as: 'group'
        }
      },
      { $unwind: '$group' },
      {
        $group: {
          _id: '$group.district',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Employee-wise collections
    const employeeStats = await Membership.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      { $match: { 'employee.role': { $ne: 'super_admin' } } },
      {
        $group: {
          _id: '$employee.fullName',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // Recent platform activity
    const recentGroups = await Group.find().sort({ createdAt: -1 }).limit(5).select('groupName village createdAt');
    const recentMembers = await WomenMember.find().sort({ createdAt: -1 }).limit(5).select('name village createdAt');

    // Recent partner/employee applications (Option A + C review queue)
    const pendingApplications = await User.find({ 
      $or: [
        { role: { $in: ['employee', 'vendor', 'sub_vendor'] }, status: 'pending' },
        { assignmentStatus: 'pending', role: { $ne: 'super_admin' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-password');

    return successResponse({
      stats: {
        totalEmployees,
        activeEmployees,
        pendingEmployees,
        rejectedEmployees,
        totalVendors,
        activeVendors,
        totalSubVendors,
        activeSubVendors,
        totalMembers,
        unassignedMembers,
        pendingConnections,
        totalGroups,
        totalCollections,
        totalPartnerSubscriptions,
        totalPartnerDeposits,
        totalRevenue,
        districtStats,
        employeeStats
      },
      pendingApplications,
      recentGroups,
      recentMembers
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return errorResponse(error.message, 500);
  }
}
