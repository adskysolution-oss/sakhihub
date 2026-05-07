import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const totalUsers = await User.countDocuments();
    const totalMembers = await User.countDocuments({ role: 'member' });
    const activeUsers = await User.countDocuments({ status: 'active' });
    const pendingApprovals = await User.countDocuments({ status: 'pending' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });

    // Recent registrations (last 5)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName mobile role status createdAt');

    return successResponse({
      stats: {
        totalUsers,
        totalMembers,
        activeUsers,
        pendingApprovals,
        inactiveUsers,
      },
      recentUsers,
    });
  } catch (error: any) {
    console.error('Admin Stats Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
