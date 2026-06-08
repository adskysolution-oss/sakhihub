import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import User from '@/models/User';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const { verifyPermission, applyRegionalFilter } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('members.view');
    if (!authorized) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const vendorCode = searchParams.get('vendorCode');
    const subVendorCode = searchParams.get('subVendorCode');
    const dateRange = searchParams.get('dateRange'); // 'all', 'today', 'yesterday', 'custom'
    const customDate = searchParams.get('customDate'); // 'YYYY-MM-DD'
    const startDate = searchParams.get('startDate'); // 'YYYY-MM-DD'
    const endDate = searchParams.get('endDate'); // 'YYYY-MM-DD'
    const paymentStatus = searchParams.get('paymentStatus'); // 'all', 'paid', 'unpaid'
    const status = searchParams.get('status'); // 'all', 'pending', etc.
    
    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;
    
    const dateQuery: any = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      if (dateRange === 'today') {
        dateQuery.createdAt = { $gte: startOfToday };
      } else if (dateRange === 'yesterday') {
        dateQuery.createdAt = { $gte: startOfYesterday, $lt: startOfToday };
      } else if (dateRange === 'custom') {
        const queryDate: any = {};
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          queryDate.$gte = start;
        } else if (customDate) {
          const start = new Date(customDate);
          start.setHours(0, 0, 0, 0);
          queryDate.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          queryDate.$lte = end;
        } else if (customDate) {
          const end = new Date(customDate);
          end.setHours(23, 59, 59, 999);
          queryDate.$lte = end;
        }
        if (Object.keys(queryDate).length > 0) {
          dateQuery.createdAt = queryDate;
        }
      }
    }

    let baseMatch: any = {
      accountStatus: { $ne: 'inactive' },
      ...dateQuery
    };
    await applyRegionalFilter(baseMatch, session);
    if (vendorCode) baseMatch.vendorCode = vendorCode;
    if (subVendorCode) baseMatch.subVendorCode = subVendorCode;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Query memberships by membershipId
      const matchingMemberships = await Membership.find({ membershipId: searchRegex }).lean();
      const memberIdsFromMembership = matchingMemberships.map(m => m.memberId);

      // Query parent users matching name, employeeId, vendorCode, subVendorCode
      const matchingUsers = await User.find({
        $or: [
          { fullName: searchRegex },
          { vendorCode: searchRegex },
          { subVendorCode: searchRegex },
          { employeeId: searchRegex }
        ]
      }, '_id').lean();
      const matchingUserIds = matchingUsers.map(u => u._id);

      // Query member users whose parent fields match
      const matchingMemberUsers = await User.find({
        role: 'member',
        $or: [
          { parentVendorId: { $in: matchingUserIds } },
          { parentVendorCode: searchRegex },
          { parentSubVendorCode: searchRegex },
          { parentEmployeeCode: searchRegex }
        ]
      }, '_id').lean();
      const matchingMemberUserIds = matchingMemberUsers.map(u => u._id);

      baseMatch.$or = [
        { name: searchRegex },
        { mobile: searchRegex },
        { village: searchRegex },
        { vendorCode: searchRegex },
        { subVendorCode: searchRegex },
        { _id: { $in: memberIdsFromMembership } },
        { userId: { $in: matchingMemberUserIds } },
        { assignedEmployeeId: { $in: matchingUserIds } }
      ];
    }

    let activePaymentStatus = paymentStatus;
    let activeStatus = status;

    if (status === 'paid' || status === 'unpaid') {
      activePaymentStatus = status;
      activeStatus = 'all';
    }

    // Status Filter Query
    let statusFilterQuery: any = {};
    if (activeStatus && activeStatus !== 'all') {
      if (activeStatus === 'pending') {
        statusFilterQuery = {
          $or: [
            { "userDoc.status": { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] } },
            { 
              $and: [
                { "userDoc.status": { $exists: false } },
                { accountStatus: 'pending' }
              ]
            }
          ]
        };
      } else {
        statusFilterQuery = {
          $or: [
            { "userDoc.status": activeStatus },
            {
              $and: [
                { "userDoc.status": { $exists: false } },
                { accountStatus: activeStatus }
              ]
            }
          ]
        };
      }
    }

    // Payment Filter Query
    let paymentFilterQuery: any = {};
    if (activePaymentStatus && activePaymentStatus !== 'all') {
      if (activePaymentStatus === 'paid') {
        paymentFilterQuery = { membershipStatus: 'paid' };
      } else if (activePaymentStatus === 'unpaid') {
        paymentFilterQuery = { membershipStatus: { $ne: 'paid' } };
      }
    }

    const aggregationResult = await WomenMember.aggregate([
      { $match: baseMatch },
      // Deduplicate by mobile, taking the newest record (by sorting createdAt descending)
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$mobile",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
      // Join User collection
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc"
        }
      },
      {
        $unwind: {
          path: "$userDoc",
          preserveNullAndEmptyArrays: true
        }
      },
      // Facets
      {
        $facet: {
          statusCounts: [
            { $match: paymentFilterQuery },
            {
              $group: {
                _id: { $ifNull: ["$userDoc.status", { $ifNull: ["$accountStatus", "active"] }] },
                count: { $sum: 1 }
              }
            }
          ],
          paymentCounts: [
            { $match: statusFilterQuery },
            {
              $group: {
                _id: {
                  $cond: [
                    { $eq: ["$membershipStatus", "paid"] },
                    "paid",
                    "unpaid"
                  ]
                },
                count: { $sum: 1 }
              }
            }
          ],
          data: [
            { $match: { ...statusFilterQuery, ...paymentFilterQuery } },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ]
        }
      }
    ]);

    const facet = aggregationResult[0] || { statusCounts: [], paymentCounts: [], data: [] };

    // Process status counts
    const rawStatusCounts: Record<string, number> = {
      pending: 0,
      documents_uploaded: 0,
      under_review: 0,
      reupload_required: 0,
      active: 0,
      rejected: 0
    };

    let totalStatusCount = 0;
    facet.statusCounts.forEach((item: any) => {
      totalStatusCount += item.count;
      if (item._id in rawStatusCounts) {
        rawStatusCounts[item._id] = item.count;
      }
    });

    const pendingSum = rawStatusCounts.pending + rawStatusCounts.documents_uploaded + rawStatusCounts.under_review + rawStatusCounts.reupload_required;

    const counts = {
      status: {
        all: totalStatusCount,
        pending: pendingSum,
        documents_uploaded: rawStatusCounts.documents_uploaded,
        under_review: rawStatusCounts.under_review,
        reupload_required: rawStatusCounts.reupload_required,
        active: rawStatusCounts.active,
        rejected: rawStatusCounts.rejected
      },
      payment: {
        all: 0,
        paid: 0,
        unpaid: 0
      }
    };

    let totalPaymentCount = 0;
    facet.paymentCounts.forEach((item: any) => {
      totalPaymentCount += item.count;
      if (item._id === 'paid') counts.payment.paid = item.count;
      if (item._id === 'unpaid') counts.payment.unpaid = item.count;
    });
    counts.payment.all = totalPaymentCount;

    // Populate data relations
    const populatedMembers = await WomenMember.populate(facet.data, [
      { path: 'groupId', select: 'groupName village district' },
      { path: 'assignedEmployeeId', select: 'fullName mobile employeeId' },
      {
        path: 'userId',
        select: 'status parentVendorId parentEmployeeCode parentVendorCode parentSubVendorCode',
        populate: {
          path: 'parentVendorId',
          select: 'fullName mobile employeeId'
        }
      }
    ]);

    // Attach membership details and deduplicated structures
    const membersList = JSON.parse(JSON.stringify(populatedMembers));
    const memberIds = membersList.map((m: any) => m._id);
    const memberships = await Membership.find({ memberId: { $in: memberIds } }).lean();

    const data = membersList.map((member: any) => {
      const membership = memberships.find((m: any) => m.memberId.toString() === member._id.toString());
      const employee = member.assignedEmployeeId || member.userId?.parentVendorId;

      return {
        ...member,
        assignedEmployeeId: employee,
        paymentStatus: member.membershipStatus === 'paid' ? 'Paid' : 'Pending',
        membershipId: membership?.membershipId || 'N/A',
        accountStatus: member.userId?.status || member.accountStatus || 'active',
        connectionStatus: member.connectionStatus
      };
    });

    return Response.json({
      success: true,
      data,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('members.update');
    if (!authorized) return error;

    const body = await req.json();
    const { id, accountStatus, connectionStatus, assignedEmployeeId } = body;
    if (!id) return errorResponse('Member ID required', 400);

    await dbConnect();
    
    const updateData: any = {};
    if (accountStatus) {
      updateData.accountStatus = accountStatus === 'active' ? 'active' : 'inactive';
    }
    if (connectionStatus) updateData.connectionStatus = connectionStatus;
    
    if (assignedEmployeeId) {
      updateData.assignedEmployeeId = assignedEmployeeId;
      updateData.connectionStatus = 'approved';
    }
    
    updateData.updatedAt = new Date();

    const member = await WomenMember.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!member) return errorResponse('Member not found', 404);

    // Finalize hierarchy if employee is assigned
    if (assignedEmployeeId) {
      const employee = await User.findById(assignedEmployeeId);
      if (employee) {
        await User.findByIdAndUpdate(member.userId, {
          parentVendorId: assignedEmployeeId,
          parentEmployeeCode: employee.employeeId,
          parentVendorCode: employee.vendorCode,
          parentSubVendorCode: employee.subVendorCode,
          assignmentStatus: 'completed',
          dashboardAccess: true,
          onboardingCompleted: true,
          status: 'active'
        });
      }
    }

    // Also sync User status if accountStatus is changed
    if (accountStatus) {
      let userStatus = 'pending';
      if (accountStatus === 'active') userStatus = 'active';
      if (accountStatus === 'suspended') userStatus = 'suspended';
      if (accountStatus === 'rejected') userStatus = 'rejected';
      
      await User.findByIdAndUpdate(member.userId, { status: userStatus });
    }

    return successResponse(member, 'Member updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Member ID required', 400);

    await dbConnect();
    
    // Perform Safe Delete / Archive
    const member = await WomenMember.findByIdAndUpdate(id, { 
      accountStatus: 'inactive',
      connectionStatus: 'unassigned' // Release from employee group
    }, { new: true });

    if (!member) return errorResponse('Member not found', 404);

    return successResponse(member, 'Member archived successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
