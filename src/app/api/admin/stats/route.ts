import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // Import models for stats
    const Group = (await import('@/models/Group')).default;
    const WomenMember = (await import('@/models/WomenMember')).default;
    const Membership = (await import('@/models/Membership')).default;

    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalMembers = await WomenMember.countDocuments();
    const totalGroups = await Group.countDocuments();
    const pendingApprovals = await User.countDocuments({ status: 'pending', role: 'employee' });
    
    const collections = await Membership.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollections = collections[0]?.total || 0;

    // Recent registrations (last 5)
    const recentUsers = await User.find({ role: 'employee' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName mobile role status designation createdAt');

    return successResponse({
      stats: {
        totalUsers,
        totalEmployees,
        totalMembers,
        totalGroups,
        pendingApprovals,
        totalCollections
      },
      recentUsers,
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
