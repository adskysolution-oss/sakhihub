import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Membership from '@/models/Membership';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    const subVendor = await User.findById((session as any).id);
    if (!subVendor) return errorResponse('Sub-Vendor not found', 404);

    // Get Membership Collections within this sub-vendor's network
    const memberUsers = await User.find({ 
      subVendorCode: subVendor.subVendorCode,
      role: 'member'
    }).select('_id');
    const memberUserIds = memberUsers.map(m => m._id);

    const { default: WomenMember } = await import('@/models/WomenMember');
    const womenMembers = await WomenMember.find({ userId: { $in: memberUserIds } }).select('_id');
    const wmIds = womenMembers.map(wm => wm._id);

    const collections = await Membership.find({ 
      memberId: { $in: wmIds } 
    }).populate('memberId', 'name mobile').sort({ createdAt: -1 });

    const transactions = collections.map(c => ({
      _id: c._id,
      description: `Membership: ${(c.memberId as any)?.name}`,
      type: 'collection',
      amount: c.amount,
      status: c.paymentStatus.toLowerCase(),
      createdAt: c.createdAt,
      txnId: c.membershipId
    }));

    return successResponse(transactions);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
