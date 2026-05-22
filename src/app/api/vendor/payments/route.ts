import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Membership from '@/models/Membership';
import SecurityDeposit from '@/models/SecurityDeposit';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    const vendor = await User.findById((session as any).id);
    if (!vendor) return errorResponse('Vendor not found', 404);

    // 1. Get Membership Collections within this vendor's network
    // (This would involve finding members belonging to this vendor)
    const memberUsers = await User.find({ 
      parentVendorId: vendor._id,
      role: 'member'
    }).select('_id');
    const memberUserIds = memberUsers.map(m => m._id);

    // We need WomenMember IDs for Membership query
    const { default: WomenMember } = await import('@/models/WomenMember');
    const womenMembers = await WomenMember.find({ userId: { $in: memberUserIds } }).select('_id');
    const wmIds = womenMembers.map(wm => wm._id);

    const collections = await Membership.find({ 
      memberId: { $in: wmIds } 
    }).populate('memberId', 'name mobile').sort({ createdAt: -1 });

    // 2. Get Security Deposits for this vendor
    const deposits = await SecurityDeposit.find({ 
      vendorId: (session as any).id 
    }).sort({ createdAt: -1 });

    // Combine into a unified transaction list for the frontend
    const transactions = [
      ...collections.map(c => ({
        _id: c._id,
        description: `Membership Collection: ${(c.memberId as any)?.name}`,
        type: 'collection',
        amount: c.amount,
        status: c.paymentStatus.toLowerCase(),
        createdAt: c.createdAt,
        txnId: c.membershipId
      })),
      ...deposits.map(d => ({
        _id: d._id,
        description: `Security Deposit for Campaign`,
        type: 'deposit',
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
        txnId: d._id.toString().substr(-8).toUpperCase()
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(transactions);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
