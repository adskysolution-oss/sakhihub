import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import Wallet from '@/models/Wallet';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'employee') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const userId = (session as any).id;

    const [totalGroups, totalMembers, wallet] = await Promise.all([
      Group.countDocuments({ createdBy: userId }),
      WomenMember.countDocuments({ createdBy: userId }),
      Wallet.findOne({ userId })
    ]);

    const walletBalance = wallet ? wallet.balance : 0;

    // Monthly stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const [monthlyMembers] = await Promise.all([
        WomenMember.countDocuments({ createdBy: userId, createdAt: { $gte: startOfMonth } })
    ]);

    return successResponse({
      stats: {
        totalGroups,
        totalMembers,
        walletBalance,
        monthlyMembers
      }
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
