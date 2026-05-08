import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getAuthSession();

    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized', 401);
    }

    let mobile = (session as any).mobile;
    if (!mobile) {
      const user = await User.findById((session as any).id);
      mobile = user?.mobile;
    }

    if (!mobile) return errorResponse('User mobile not found', 404);

    const fieldRecord = await WomenMember.findOne({ mobile });
    if (!fieldRecord) return errorResponse('Membership record not found', 404);

    const membership = await Membership.findOne({ memberId: fieldRecord._id });
    if (!membership) return errorResponse('Receipt not generated yet', 404);

    return successResponse(membership, 'Receipt fetched successfully');

  } catch (error: any) {
    return errorResponse('Internal Server Error', 500);
  }
}
