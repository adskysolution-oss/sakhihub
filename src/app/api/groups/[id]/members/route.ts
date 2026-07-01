import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import WomenMember from '@/models/WomenMember';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const role = (session as any).role;
    const userId = (session as any).id;
    const userProfile = await User.findById(userId);

    const group = await Group.findById(groupId);
    if (!group) return errorResponse('Group not found', 404);

    // Validate permission: Employee must own the group or be a reporting coordinator
    if (role === 'employee') {
      let isAuthorized = group.createdBy.toString() === userId;
      if (!isAuthorized) {
        const { isReportingEmployee } = await import('@/utils/hierarchy');
        const creatorUser = await User.findById(group.createdBy);
        isAuthorized = creatorUser && userProfile && await isReportingEmployee(userProfile, creatorUser);
      }
      if (!isAuthorized) {
        return errorResponse('Forbidden: You do not have access to this group\'s members', 403);
      }
    } else if (!['super_admin', 'operations_admin', 'vendor', 'sub_vendor'].includes(role)) {
      return errorResponse('Forbidden', 403);
    }

    // Query all members of this group (Full Members & Reporting Members)
    const query = { groupId: new mongoose.Types.ObjectId(groupId) };
    const members = await WomenMember.find(query)
      .sort({ createdAt: -1 })
      .populate('groupId', 'groupName village')
      .populate('assignedEmployeeId', 'fullName mobile employeeId')
      .populate({
        path: 'userId',
        select: 'parentVendorId parentEmployeeCode parentVendorCode parentSubVendorCode status otpExpires',
        populate: {
          path: 'parentVendorId',
          select: 'fullName mobile employeeId'
        }
      });

    // Deduplicate and process members
    const uniqueMembersMap = new Map();

    members.forEach(member => {
      // Filter out orphan records ONLY for full members (where userId is populated but null)
      // Reporting members have userId as null/undefined, but they are NOT orphan records.
      if (member.userId === null && member.memberType !== 'REPORTING_MEMBER') {
        return;
      }

      let activationStatus = 'Activated';
      if (member.memberType === 'REPORTING_MEMBER') {
        activationStatus = 'Reporting Member';
      } else if (member.userId && typeof member.userId === 'object') {
        const userDoc = member.userId as any;
        if (userDoc.status === 'pending_registration') {
          const isExpired = userDoc.otpExpires && new Date() > new Date(userDoc.otpExpires);
          activationStatus = isExpired ? 'Activation Expired' : 'Pending Activation';
        }
      }

      // Use mobile or _id as unique key
      const key = member.mobile || member._id.toString();
      if (!uniqueMembersMap.has(key)) {
        const employee = member.assignedEmployeeId || (member.userId as any)?.parentVendorId;

        uniqueMembersMap.set(key, {
          ...member.toObject(),
          assignedEmployeeId: employee,
          paymentStatus: member.membershipStatus === 'paid' ? 'Paid' : 'Pending',
          accountStatus: member.accountStatus,
          connectionStatus: member.connectionStatus,
          activationStatus: activationStatus
        });
      }
    });

    return successResponse(Array.from(uniqueMembersMap.values()));
  } catch (error: any) {
    console.error('Group Members GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
