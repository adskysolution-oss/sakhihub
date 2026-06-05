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

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // 1. Fetch all active/approved users to build hierarchy in memory
    const users = await User.find({ status: { $in: ['active', 'approved'] } })
      .select('_id parentVendorId role fullName vendorCode subVendorCode employeeId')
      .lean();

    const adjList: Record<string, string[]> = {};
    const userMap: Record<string, any> = {};
    
    users.forEach(u => {
      const id = u._id.toString();
      userMap[id] = u;
      if (u.parentVendorId) {
        const pId = u.parentVendorId.toString();
        if (!adjList[pId]) adjList[pId] = [];
        adjList[pId].push(id);
      }
    });

    // Helper to get descendant IDs
    function getDescendantIds(userIdStr: string): string[] {
      const list: string[] = [];
      const queue = [userIdStr];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const children = adjList[curr] || [];
        children.forEach(child => {
          list.push(child);
          queue.push(child);
        });
      }
      return list;
    }

    // 2. Fetch required transaction and member data
    const members = await WomenMember.find({ accountStatus: 'active' })
      .select('_id assignedEmployeeId subVendorCode vendorCode createdAt accountStatus connectionStatus')
      .lean();

    const memberships = await Membership.find({ 
      paymentStatus: 'Paid',
      paymentDate: { $gte: start, $lte: end }
    }).select('memberId amount employeeId').lean();

    const deposits = await SecurityDeposit.find({
      paymentStatus: 'paid',
      paymentDate: { $gte: start, $lte: end }
    }).select('vendorId paidAmount').lean();

    const manualPayments = await ManualPaymentRequest.find({
      status: 'approved',
      type: 'subscription',
      paymentDate: { $gte: start, $lte: end }
    }).select('userId amount').lean();

    const onlineTx = await PaymentTransaction.find({
      status: { $in: ['paid', 'completed', 'success'] },
      paidAt: { $gte: start, $lte: end }
    }).select('userId amount type').lean();

    // 3. Compute stats for each user role
    const leaderboards = {
      vendors: [] as any[],
      subVendors: [] as any[],
      employees: [] as any[]
    };

    const vendorsList = users.filter(u => u.role === 'vendor');
    const subVendorsList = users.filter(u => u.role === 'sub_vendor');
    const employeesList = users.filter(u => u.role === 'employee');

    // Process Vendors
    vendorsList.forEach(v => {
      const vIdStr = v._id.toString();
      const descendantIds = getDescendantIds(vIdStr);
      const allUserIds = [vIdStr, ...descendantIds];

      const vCodes = [v, ...descendantIds.map(id => userMap[id])]
        .filter(u => u && u.role === 'vendor' && u.vendorCode)
        .map(u => u.vendorCode);
      const svCodes = [v, ...descendantIds.map(id => userMap[id])]
        .filter(u => u && u.role === 'sub_vendor' && u.subVendorCode)
        .map(u => u.subVendorCode);

      const vMembers = members.filter(m => 
        (m.assignedEmployeeId && allUserIds.includes(m.assignedEmployeeId.toString())) ||
        (m.subVendorCode && svCodes.includes(m.subVendorCode)) ||
        (m.vendorCode && vCodes.includes(m.vendorCode))
      );

      const vMemberIdsStr = vMembers.map(m => m._id.toString());
      const newMembers = vMembers.filter(m => m.createdAt >= start && m.createdAt <= end).length;

      // Collections
      const membershipSum = memberships.filter(m => vMemberIdsStr.includes(m.memberId.toString())).reduce((sum, m) => sum + m.amount, 0);
      const depositSum = deposits.filter(d => allUserIds.includes(d.vendorId.toString())).reduce((sum, d) => sum + (d.paidAmount || 0), 0);
      const subscriptionSum = manualPayments.filter(p => allUserIds.includes(p.userId.toString())).reduce((sum, p) => sum + p.amount, 0);
      const onlineDepositSum = onlineTx.filter(t => t.type === 'deposit' && allUserIds.includes(t.userId.toString())).reduce((sum, t) => sum + t.amount, 0);
      const onlineSubscriptionSum = onlineTx.filter(t => t.type === 'subscription' && allUserIds.includes(t.userId.toString())).reduce((sum, t) => sum + t.amount, 0);
      const totalCollections = membershipSum + depositSum + onlineDepositSum + subscriptionSum + onlineSubscriptionSum;

      // Activation Rate
      const activeCount = vMembers.filter(m => m.accountStatus === 'active').length;
      const activationRate = vMembers.length > 0 ? (activeCount / vMembers.length) * 100 : 0;

      leaderboards.vendors.push({
        id: vIdStr,
        name: v.fullName,
        code: v.vendorCode || '',
        memberGrowth: newMembers,
        collections: totalCollections,
        activationRate: Math.round(activationRate)
      });
    });

    // Process Sub-Vendors
    subVendorsList.forEach(sv => {
      const svIdStr = sv._id.toString();
      const descendantIds = getDescendantIds(svIdStr);
      const allUserIds = [svIdStr, ...descendantIds];

      const svCodes = [sv, ...descendantIds.map(id => userMap[id])]
        .filter(u => u && u.role === 'sub_vendor' && u.subVendorCode)
        .map(u => u.subVendorCode);

      const svMembers = members.filter(m => 
        (m.assignedEmployeeId && allUserIds.includes(m.assignedEmployeeId.toString())) ||
        (m.subVendorCode && svCodes.includes(m.subVendorCode))
      );

      const svMemberIdsStr = svMembers.map(m => m._id.toString());
      const newMembers = svMembers.filter(m => m.createdAt >= start && m.createdAt <= end).length;

      // Collections
      const membershipSum = memberships.filter(m => svMemberIdsStr.includes(m.memberId.toString())).reduce((sum, m) => sum + m.amount, 0);
      const depositSum = deposits.filter(d => allUserIds.includes(d.vendorId.toString())).reduce((sum, d) => sum + (d.paidAmount || 0), 0);
      const subscriptionSum = manualPayments.filter(p => allUserIds.includes(p.userId.toString())).reduce((sum, p) => sum + p.amount, 0);
      const onlineDepositSum = onlineTx.filter(t => t.type === 'deposit' && allUserIds.includes(t.userId.toString())).reduce((sum, t) => sum + t.amount, 0);
      const onlineSubscriptionSum = onlineTx.filter(t => t.type === 'subscription' && allUserIds.includes(t.userId.toString())).reduce((sum, t) => sum + t.amount, 0);
      const totalCollections = membershipSum + depositSum + onlineDepositSum + subscriptionSum + onlineSubscriptionSum;

      // Activation Rate
      const activeCount = svMembers.filter(m => m.accountStatus === 'active').length;
      const activationRate = svMembers.length > 0 ? (activeCount / svMembers.length) * 100 : 0;

      leaderboards.subVendors.push({
        id: svIdStr,
        name: sv.fullName,
        code: sv.subVendorCode || '',
        memberGrowth: newMembers,
        collections: totalCollections,
        activationRate: Math.round(activationRate)
      });
    });

    // Process Employees
    employeesList.forEach(emp => {
      const empIdStr = emp._id.toString();
      const empMembers = members.filter(m => m.assignedEmployeeId && m.assignedEmployeeId.toString() === empIdStr);
      const empMemberIdsStr = empMembers.map(m => m._id.toString());
      const newMembers = empMembers.filter(m => m.createdAt >= start && m.createdAt <= end).length;

      // Collections
      const membershipSum = memberships.filter(m => empMemberIdsStr.includes(m.memberId.toString())).reduce((sum, m) => sum + m.amount, 0);
      const subscriptionSum = manualPayments.filter(p => p.userId.toString() === empIdStr).reduce((sum, p) => sum + p.amount, 0);
      const onlineSubscriptionSum = onlineTx.filter(t => t.type === 'subscription' && t.userId.toString() === empIdStr).reduce((sum, t) => sum + t.amount, 0);
      const onlineDepositSum = onlineTx.filter(t => t.type === 'deposit' && t.userId.toString() === empIdStr).reduce((sum, t) => sum + t.amount, 0);
      const totalCollections = membershipSum + subscriptionSum + onlineSubscriptionSum + onlineDepositSum;

      // Activation Rate
      const activeCount = empMembers.filter(m => m.accountStatus === 'active').length;
      const activationRate = empMembers.length > 0 ? (activeCount / empMembers.length) * 100 : 0;

      leaderboards.employees.push({
        id: empIdStr,
        name: emp.fullName,
        code: emp.employeeId || '',
        memberGrowth: newMembers,
        collections: totalCollections,
        activationRate: Math.round(activationRate)
      });
    });

    // Sort and slice top 5
    leaderboards.vendors.sort((a, b) => b.memberGrowth - a.memberGrowth || b.collections - a.collections);
    leaderboards.subVendors.sort((a, b) => b.memberGrowth - a.memberGrowth || b.collections - a.collections);
    leaderboards.employees.sort((a, b) => b.memberGrowth - a.memberGrowth || b.collections - a.collections);

    return successResponse({
      vendors: leaderboards.vendors.slice(0, 5),
      subVendors: leaderboards.subVendors.slice(0, 5),
      employees: leaderboards.employees.slice(0, 5)
    });
  } catch (error: any) {
    console.error('Leaderboard Compilation Error:', error);
    return errorResponse(error.message, 500);
  }
}
