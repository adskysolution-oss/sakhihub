import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
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
    const search = searchParams.get('search');
    
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await WomenMember.find(query)
      .populate('groupId', 'groupName village district')
      .sort({ createdAt: -1 });

    // Attach membership status to each member
    const memberIds = members.map(m => m._id);
    const memberships = await Membership.find({ memberId: { $in: memberIds } });

    const data = members.map(member => {
      const membership = memberships.find(m => m.memberId.toString() === member._id.toString());
      return {
        ...member.toObject(),
        paymentStatus: membership?.paymentStatus || 'Pending',
        membershipId: membership?.membershipId || 'N/A'
      };
    });

    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
