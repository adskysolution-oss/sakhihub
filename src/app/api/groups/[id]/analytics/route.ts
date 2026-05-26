import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const role = (session as any).role;
    const userId = (session as any).id;

    const group = await Group.findById(id).populate('createdBy', 'fullName employeeId status');
    if (!group) return errorResponse('Group not found', 404);

    // Permission check
    if (role === 'employee' && group.createdBy._id.toString() !== userId) {
      return errorResponse('Forbidden', 403);
    }

    const groupId = new mongoose.Types.ObjectId(id);

    // Run aggregations in parallel
    const [membersData, financialData] = await Promise.all([
      // Member Stats
      WomenMember.aggregate([
        { $match: { groupId } },
        {
          $group: {
            _id: null,
            totalMembers: { $sum: 1 },
            paidMembers: { $sum: { $cond: [{ $eq: ['$membershipStatus', 'paid'] }, 1, 0] } },
            freeMembers: { $sum: { $cond: [{ $eq: ['$membershipStatus', 'free'] }, 1, 0] } },
            connectedMembers: { $sum: { $cond: [{ $eq: ['$connectionStatus', 'connected'] }, 1, 0] } }
          }
        }
      ]),
      // Financial Stats
      Membership.aggregate([
        { $match: { groupId, paymentStatus: 'Paid' } },
        {
          $group: {
            _id: null,
            totalCollection: { $sum: '$amount' },
            verifiedPayments: { $sum: 1 }
          }
        }
      ])
    ]);

    const memberStats = membersData[0] || { totalMembers: 0, paidMembers: 0, freeMembers: 0, connectedMembers: 0 };
    const financeStats = financialData[0] || { totalCollection: 0, verifiedPayments: 0 };

    // Fetch recently added members
    const recentMembers = await WomenMember.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name mobile village membershipStatus createdAt');

    return successResponse({
      group,
      stats: {
        ...memberStats,
        ...financeStats
      },
      recentMembers
    });
  } catch (error: any) {
    console.error('Group Analytics GET Error:', error);
    return errorResponse(error.message, 500);
  }
}
