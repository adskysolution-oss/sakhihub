import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import AbhaCard from '@/models/AbhaCard';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized access', 401);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'linked' or 'created'
    const role = searchParams.get('role'); // user role filter

    await dbConnect();

    let query: any = {};

    // Apply status filter if set
    if (status && status !== 'all') {
      query.status = status;
    }

    // Apply search filter on ABHA fields and profile payload fields
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { abhaNumber: { $regex: escapedSearch, $options: 'i' } },
        { abhaAddress: { $regex: escapedSearch, $options: 'i' } },
        { 'profilePayload.fullName': { $regex: escapedSearch, $options: 'i' } },
        { 'profilePayload.mobile': { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    // If role filter is applied, we must first find matching user IDs
    let userIdsFilter: any = null;
    if (role && role !== 'all') {
      const users = await User.find({ role }).select('_id').lean();
      userIdsFilter = users.map(u => u._id);
      query.userId = { $in: userIdsFilter };
    }

    // Query cards and populate user metadata
    const cards = await AbhaCard.find(query)
      .populate('userId', 'fullName role mobile email status')
      .sort({ createdAt: -1 })
      .lean();

    // If a role filter was applied, make sure we only include matched entries
    // (though the query.userId constraint above already handles this).
    const filteredCards = cards.filter(card => card.userId !== null);

    return successResponse(filteredCards, 'ABHA records retrieved successfully');
  } catch (error: any) {
    console.error('Fetch Admin ABHA Error:', error);
    return errorResponse(error.message || 'Failed to retrieve ABHA list', 500);
  }
}
