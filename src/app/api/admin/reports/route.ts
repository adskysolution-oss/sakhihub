import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import Membership from '@/models/Membership';
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

    // Aggregate monthly registrations
    const monthlyRegs = await WomenMember.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Aggregate monthly collections
    const monthlyCollections = await Membership.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Employee performance (members added by each employee)
    const employeePerformance = await WomenMember.aggregate([
      {
        $group: {
          _id: "$createdBy",
          membersCount: { $sum: 1 }
        }
      },
      { $sort: { membersCount: -1 } },
      { $limit: 10 }
    ]);

    // Populate employee names manually or via $lookup
    const populatedPerformance = await Promise.all(employeePerformance.map(async (perf) => {
      const employee = await User.findById(perf._id).select('fullName mobile');
      return {
        ...perf,
        employeeName: employee?.fullName || 'System/Admin',
        mobile: employee?.mobile || 'N/A'
      };
    }));

    return successResponse({
      monthlyRegs,
      monthlyCollections,
      employeePerformance: populatedPerformance
    });

  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
