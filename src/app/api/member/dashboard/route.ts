import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import Group from '@/models/Group';
import User from '@/models/User';
import MemberRequest from '@/models/MemberRequest';
import CommissionConfig from '@/models/CommissionConfig';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getAuthSession();

    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized', 401);
    }

    const userId = (session as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Find the linked field record using userId
    const fieldRecord = await WomenMember.findOne({ userId: user._id })
      .populate('groupId', 'groupName village district block')
      .populate('assignedEmployeeId', 'fullName mobile employeeId')
      .populate('createdBy', 'fullName mobile');

    let membership = null;
    if (fieldRecord) {
      membership = await Membership.findOne({ memberId: fieldRecord._id })
        .sort({ createdAt: -1 });
    }

    // Fetch any pending requests for this member
    const pendingRequests = await MemberRequest.find({
      memberId: user._id,
      status: 'pending'
    }).populate('employeeId', 'fullName mobile employeeId area block');

    const commConfig = await CommissionConfig.findOne({ key: 'default' });
    const membershipFee = commConfig ? (commConfig.membershipFee ?? 100) : 100;

    return successResponse({
      profile: user,
      fieldRecord: fieldRecord || null,
      membership: membership || null,
      pendingRequests: pendingRequests || [],
      membershipFee
    }, 'Member dashboard data fetched successfully');

  } catch (error: any) {
    console.error('Member Dashboard API Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
