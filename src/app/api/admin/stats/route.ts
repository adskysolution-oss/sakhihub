import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !['super_admin', 'operations_admin'].includes((session as any).role)) {
      return errorResponse('Unauthorized', 403);
    }

    const sessionUser = session as any;
    await dbConnect();
    const AuditLog = (await import('@/models/AuditLog')).default;

    const isOperationsAdmin = sessionUser.role === 'operations_admin';
    if (isOperationsAdmin) {
      const dbUser = await User.findById(sessionUser.id).lean();
      
      let regionalMatch: any = { role: { $in: ['employee', 'vendor', 'sub_vendor', 'member'] } };
      if (dbUser && dbUser.assignedScope === 'regional') {
        const filters: any[] = [];
        if (dbUser.assignedStates?.length) filters.push({ state: { $in: dbUser.assignedStates } });
        if (dbUser.assignedDistricts?.length) filters.push({ district: { $in: dbUser.assignedDistricts } });
        if (filters.length > 0) regionalMatch.$or = filters;
      }

      const pendingDocumentsCount = await User.countDocuments({
        ...regionalMatch,
        status: { $in: ['documents_uploaded', 'under_review'] }
      });

      const pendingVerificationsCount = await User.countDocuments({
        ...regionalMatch,
        documentsVerified: false,
        status: { $in: ['documents_uploaded', 'under_review', 'pending'] }
      });

      const VendorAgreement = (await import('@/models/VendorAgreement')).default;
      const allRegionalPartners = await User.find({
        ...regionalMatch,
        role: { $in: ['vendor', 'sub_vendor'] },
        status: 'active'
      }).select('_id');
      const partnerIds = allRegionalPartners.map(p => p._id);
      const generatedAgreements = await VendorAgreement.find({ vendorId: { $in: partnerIds } }).select('vendorId');
      const generatedPartnerIds = generatedAgreements.map((g: any) => g.vendorId.toString());
      const pendingAgreementsCount = partnerIds.filter(id => !generatedPartnerIds.includes(id.toString())).length;

      const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
      const allRegionalEmployees = await User.find({
        ...regionalMatch,
        role: 'employee',
        status: 'active'
      }).select('_id');
      const employeeIds = allRegionalEmployees.map(e => e._id);
      const generatedOfferLetters = await EmployeeOfferLetter.find({ employeeId: { $in: employeeIds } }).select('employeeId');
      const generatedEmployeeIds = generatedOfferLetters.map((g: any) => g.employeeId.toString());
      const pendingOfferLettersCount = employeeIds.filter(id => !generatedEmployeeIds.includes(id.toString())).length;

      const DailyReport = (await import('@/models/DailyReport')).default;
      let reportQuery: any = {};
      if (dbUser && dbUser.assignedScope === 'regional') {
        const regionalEmployees = await User.find({
          ...regionalMatch,
          role: 'employee'
        }).select('_id');
        reportQuery.employeeId = { $in: regionalEmployees.map(e => e._id) };
      }
      const pendingReportsCount = await DailyReport.countDocuments(reportQuery);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActionsCount = await AuditLog.countDocuments({
        performedBy: sessionUser.id,
        timestamp: { $gte: today }
      });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyActionsCount = await AuditLog.countDocuments({
        performedBy: sessionUser.id,
        timestamp: { $gte: oneWeekAgo }
      });

      const recentLogs = await AuditLog.find({ performedBy: sessionUser.id })
        .populate('targetUser', 'fullName role')
        .sort({ timestamp: -1 })
        .limit(10);

      return successResponse({
        isOperationsAdmin: true,
        stats: {
          pendingDocuments: pendingDocumentsCount,
          pendingVerifications: pendingVerificationsCount,
          pendingAgreements: pendingAgreementsCount,
          pendingOfferLetters: pendingOfferLettersCount,
          pendingReports: pendingReportsCount,
          todayActions: todayActionsCount,
          weeklyActions: weeklyActionsCount
        },
        recentLogs
      });
    }

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
      { $match: { type: 'subscription', status: { $in: ['paid', 'completed', 'success'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPartnerSubscriptions = partnerSubscriptionsAgg[0]?.total || 0;

    const partnerDepositsAgg = await PaymentTransaction.aggregate([
      { $match: { type: 'deposit', status: { $in: ['paid', 'completed', 'success'] } } },
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
