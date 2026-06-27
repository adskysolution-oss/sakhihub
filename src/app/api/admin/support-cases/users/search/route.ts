import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import User from '@/models/User';
import Membership from '@/models/Membership';
import WomenMember from '@/models/WomenMember';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission, applyRegionalFilter } = await import('@/utils/authHelpers');

    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await hasPermission(currentUserId, (session as any).role, 'support.search_user');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    if (!search || search.trim() === '') {
      return successResponse([], 'No search term provided');
    }

    await dbConnect();

    // Concurrency safe: Parse search queries and check databases
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, 'i');
    const cleanPhone = search.replace(/\D/g, '');

    const matchedUserIds: any[] = [];

    // Find memberships matching search term (Member ID)
    const matchingMemberships = await Membership.find({ membershipId: searchRegex }).lean();
    if (matchingMemberships.length > 0) {
      const wmIds = matchingMemberships.map(m => m.memberId);
      const matchingWomenMembers = await WomenMember.find({ _id: { $in: wmIds } }).lean();
      matchingWomenMembers.forEach(wm => {
        if (wm.userId) matchedUserIds.push(wm.userId.toString());
      });
    }

    // Build the query
    let query: any = {
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { vendorCode: searchRegex },
        { subVendorCode: searchRegex }
      ]
    };

    if (cleanPhone) {
      query.$or.push({ mobile: { $regex: cleanPhone, $options: 'i' } });
    } else {
      query.$or.push({ mobile: searchRegex });
    }

    if (matchedUserIds.length > 0) {
      query.$or.push({ _id: { $in: matchedUserIds } });
    }

    // Apply regional scoping filters for operations admins or staff
    query = await applyRegionalFilter(query, session);

    // Fetch matching users and select fields needed for the Summary Card
    const users = await User.find(query)
      .select('fullName mobile email role status onboardingCompleted paymentCompleted paymentStatus documentsVerified assignmentStatus profileImage createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return successResponse(users, 'Users fetched successfully');
  } catch (error: any) {
    console.error('Support Users Search Error:', error);
    return errorResponse(error.message || 'Failed to search users', 500);
  }
}
