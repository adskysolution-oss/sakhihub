import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getAuthSession();

    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById((session as any).id);
    if (!user) return errorResponse('User not found', 404);

    const fieldRecord = await WomenMember.findOne({ mobile: user.mobile })
      .populate({
        path: 'groupId',
        populate: {
          path: 'createdBy',
          select: 'fullName mobile designation'
        }
      });

    if (!fieldRecord) return errorResponse('Group assignment not found', 404);

    // Find other members in the same group
    const groupMembers = await WomenMember.find({ groupId: fieldRecord.groupId._id })
      .select('name mobile village membershipStatus');

    return successResponse({
      group: fieldRecord.groupId,
      members: groupMembers,
      myStatus: fieldRecord.membershipStatus
    }, 'Group data fetched successfully');

  } catch (error: any) {
    console.error('Member Group API Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
