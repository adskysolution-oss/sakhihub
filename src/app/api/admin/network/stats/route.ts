import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
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
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('network.view');
    if (!authorized) return error;

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get('nodeId');

    if (!nodeId) {
      return errorResponse('Node ID is required', 400);
    }

    const userObjectId = new mongoose.Types.ObjectId(nodeId);
    let targetUser = await User.findById(userObjectId).lean();
    let isMember = false;
    let targetMember = null;

    if (!targetUser) {
      targetMember = await WomenMember.findById(userObjectId).lean();
      if (!targetMember) {
        return errorResponse('User not found', 404);
      }
      isMember = true;
    }

    if (isMember && targetMember) {
      const membership = await Membership.findOne({ memberId: userObjectId }).lean();
      return successResponse({
        id: targetMember._id.toString(),
        name: targetMember.name,
        role: 'member',
        status: targetMember.membershipStatus || 'unpaid',
        connectionStatus: targetMember.connectionStatus || 'pending',
        mobile: targetMember.mobile,
        location: targetMember.village || 'N/A',
        counts: {
          subVendors: 0,
          employees: 0,
          members: 0
        },
        geography: {
          states: targetMember.state ? 1 : 0,
          districts: targetMember.district ? 1 : 0,
          blocks: targetMember.block ? 1 : 0,
          areas: targetMember.village ? 1 : 0
        },
        collections: {
          paid: membership && membership.paymentStatus === 'Paid' ? membership.amount : 0,
          pending: membership && membership.paymentStatus === 'Pending' ? membership.amount : 0,
          failed: membership && membership.paymentStatus === 'Failed' ? membership.amount : 0,
          split: {
            membership: membership && membership.paymentStatus === 'Paid' ? membership.amount : 0,
            deposit: 0,
            subscription: 0
          }
        },
        riskFlags: []
      });
    }


    // 1. Fetch recursively all downstream sub-vendors and employees
    const userHierarchy = await User.aggregate([
      { $match: { _id: userObjectId } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentVendorId',
          as: 'descendants'
        }
      }
    ]);

    const descendants: any[] = userHierarchy[0]?.descendants || [];
    const directAndIndirectUserIds = [userObjectId, ...descendants.map((d: any) => d._id)];

    const subVendors = descendants.filter((d: any) => d.role === 'sub_vendor');
    const employees = descendants.filter((d: any) => d.role === 'employee');

    // 2. Fetch all members managed directly or indirectly under this downstream chain
    const vendorCodes = [targetUser, ...descendants]
      .filter((u: any) => u.role === 'vendor' && u.vendorCode)
      .map((u: any) => u.vendorCode);
    const subVendorCodes = [targetUser, ...descendants]
      .filter((u: any) => u.role === 'sub_vendor' && u.subVendorCode)
      .map((u: any) => u.subVendorCode);

    const matchingMembers = await WomenMember.find({
      $or: [
        { assignedEmployeeId: { $in: directAndIndirectUserIds } },
        { subVendorCode: { $in: subVendorCodes } },
        { vendorCode: { $in: vendorCodes } }
      ]
    }).lean();


    // 3. Status splits
    const activeMembers = matchingMembers.filter((m: any) => m.accountStatus === 'active').length;
    const pendingMembers = matchingMembers.filter((m: any) => m.connectionStatus === 'pending_request').length;
    const rejectedMembers = matchingMembers.filter((m: any) => m.connectionStatus === 'rejected').length;

    const activeEmployees = employees.filter((e: any) => e.status === 'active').length;
    const pendingEmployees = employees.filter((e: any) => e.status === 'pending').length;
    const rejectedEmployees = employees.filter((e: any) => e.status === 'rejected').length;

    const activeSubVendors = subVendors.filter((s: any) => s.status === 'active').length;
    const pendingSubVendors = subVendors.filter((s: any) => s.status === 'pending').length;
    const rejectedSubVendors = subVendors.filter((s: any) => s.status === 'rejected').length;

    // 4. Financial metrics
    const memberIds = matchingMembers.map((m: any) => m._id);
    const memberships = await Membership.find({ memberId: { $in: memberIds } }).lean();

    const membershipPaid = memberships.filter((m: any) => m.paymentStatus === 'Paid').reduce((sum, m) => sum + m.amount, 0);
    const membershipPending = memberships.filter((m: any) => m.paymentStatus === 'Pending').reduce((sum, m) => sum + m.amount, 0);
    const membershipFailed = memberships.filter((m: any) => m.paymentStatus === 'Failed').reduce((sum, m) => sum + m.amount, 0);

    const deposits = await SecurityDeposit.find({ vendorId: { $in: directAndIndirectUserIds } }).lean();
    const depositPaid = deposits.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
    const depositPending = deposits.filter((d: any) => d.paymentStatus === 'pending').reduce((sum, d) => sum + (d.amount || 0), 0);

    const manualPayments = await ManualPaymentRequest.find({ userId: { $in: directAndIndirectUserIds } }).lean();
    const subscriptionPaid = manualPayments.filter((p: any) => p.type === 'subscription' && p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
    const subscriptionPending = manualPayments.filter((p: any) => p.type === 'subscription' && p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

    // Online Payments
    const onlineTx = await PaymentTransaction.find({
      userId: { $in: directAndIndirectUserIds }
    }).lean();

    const onlineDepositPaid = onlineTx.filter((t: any) => t.type === 'deposit' && ['paid', 'completed', 'success'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);
    const onlineDepositPending = onlineTx.filter((t: any) => t.type === 'deposit' && ['pending', 'created'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);

    const onlineSubscriptionPaid = onlineTx.filter((t: any) => t.type === 'subscription' && ['paid', 'completed', 'success'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);
    const onlineSubscriptionPending = onlineTx.filter((t: any) => t.type === 'subscription' && ['pending', 'created'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);

    const totalPaidCollections = membershipPaid + depositPaid + onlineDepositPaid + subscriptionPaid + onlineSubscriptionPaid;
    const totalPendingCollections = membershipPending + depositPending + onlineDepositPending + subscriptionPending + onlineSubscriptionPending;
    const totalFailedCollections = membershipFailed;

    // 5. Geographic scope
    const states = new Set<string>();
    const districts = new Set<string>();
    const blocks = new Set<string>();
    const areas = new Set<string>();

    [targetUser, ...descendants].forEach((u: any) => {
      if (u.state) states.add(u.state);
      if (u.district) districts.add(u.district);
      if (u.block) blocks.add(u.block);
      if (u.area) areas.add(u.area);
    });

    matchingMembers.forEach((m: any) => {
      if (m.state) states.add(m.state);
      if (m.district) districts.add(m.district);
      if (m.block) blocks.add(m.block);
      if (m.village) areas.add(m.village);
    });

    const geography = {
      states: states.size,
      districts: districts.size,
      blocks: blocks.size,
      areas: areas.size
    };

    // 6. Downstream Risk Flags
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const riskFlags: string[] = [];

    if (targetUser.role === 'vendor' && subVendors.filter((s: any) => s.status === 'active').length === 0) {
      riskFlags.push('No active Sub-Vendors registered downstream.');
    }
    if (targetUser.role === 'sub_vendor' && employees.filter((e: any) => e.status === 'active').length === 0) {
      riskFlags.push('No active Employees assigned downstream.');
    }
    if (targetUser.role === 'employee' && matchingMembers.length === 0) {
      riskFlags.push('Zero downstream Members registered.');
    }

    const unverifiedUsersCount = [targetUser, ...descendants].filter(
      (u: any) => u.status === 'pending' && new Date(u.createdAt) < thirtyDaysAgo
    ).length;
    const unverifiedMembersCount = matchingMembers.filter(
      (m: any) => m.connectionStatus === 'pending_request' && new Date(m.createdAt) < thirtyDaysAgo
    ).length;

    if (unverifiedUsersCount + unverifiedMembersCount > 0) {
      riskFlags.push(`${unverifiedUsersCount + unverifiedMembersCount} records with verification pending for > 30 days.`);
    }

    const unpaidEmployeesCount = employees.filter((e: any) => !e.paymentCompleted && !e.subscriptionPaid).length;
    if (unpaidEmployeesCount > 0) {
      riskFlags.push(`${unpaidEmployeesCount} Employees with pending payments.`);
    }

    const incompleteDocsCount = [targetUser, ...descendants].filter((u: any) => u.status === 'reupload_required').length;
    if (incompleteDocsCount > 0) {
      riskFlags.push(`${incompleteDocsCount} profile records have incomplete/re-upload document status.`);
    }

    return successResponse({
      id: targetUser._id.toString(),
      name: targetUser.fullName,
      role: targetUser.role,
      counts: {
        subVendors: subVendors.length,
        employees: employees.length,
        members: matchingMembers.length
      },
      statusSplits: {
        members: { active: activeMembers, pending: pendingMembers, rejected: rejectedMembers },
        employees: { active: activeEmployees, pending: pendingEmployees, rejected: rejectedEmployees },
        subVendors: { active: activeSubVendors, pending: pendingSubVendors, rejected: rejectedSubVendors }
      },
      collections: {
        paid: totalPaidCollections,
        pending: totalPendingCollections,
        failed: totalFailedCollections,
        split: {
          membership: membershipPaid,
          deposit: depositPaid + onlineDepositPaid,
          subscription: subscriptionPaid + onlineSubscriptionPaid
        }
      },
      geography,
      riskFlags
    });
  } catch (error: any) {
    console.error('Stats Calculation Error:', error);
    return errorResponse(error.message, 500);
  }
}
