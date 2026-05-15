import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getAuthSession();

    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById((session as any).id).select('-password');
    if (!user) return errorResponse('User not found', 404);

    const fieldRecord = await WomenMember.findOne({ mobile: user.mobile })
      .populate('groupId', 'groupName village district block');

    const membership = fieldRecord 
      ? await Membership.findOne({ memberId: fieldRecord._id }).sort({ createdAt: -1 })
      : null;

    return successResponse({
      user,
      fieldRecord,
      membership
    }, 'Profile fetched successfully');

  } catch (error: any) {
    return errorResponse('Internal Server Error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { address } = await req.json();
    const user = await User.findByIdAndUpdate(
      (session as any).id,
      { address },
      { new: true }
    ).select('-password');

    return successResponse(user, 'Profile updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
