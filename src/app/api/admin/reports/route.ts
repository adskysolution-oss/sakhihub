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
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('reports.view');
    if (!authorized || !session) return error;

    await dbConnect();

    // Check regional boundaries
    const sessionUser = session as any;
    const dbUser = await User.findById(sessionUser.id).lean();
    let regionalMatch: any = {};
    if (dbUser && !['all', 'all_india'].includes(dbUser.assignedScope || 'all')) {
      const filters: any[] = [];
      if (dbUser.assignedStates?.length) filters.push({ state: { $in: dbUser.assignedStates } });
      if (dbUser.assignedDistricts?.length) filters.push({ district: { $in: dbUser.assignedDistricts } });
      if (dbUser.assignedBlocks?.length) filters.push({ block: { $in: dbUser.assignedBlocks } });
      if (filters.length > 0) regionalMatch.$or = filters;
    }

    // Aggregate monthly registrations
    const regStages: any[] = [];
    if (Object.keys(regionalMatch).length > 0) {
      regStages.push({ $match: regionalMatch });
    }
    regStages.push(
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    );
    const monthlyRegs = await WomenMember.aggregate(regStages);

    // Aggregate monthly collections with regional lookup
    const membershipMatchStages: any[] = [
      { $match: { paymentStatus: 'Paid' } }
    ];
    if (dbUser && !['all', 'all_india'].includes(dbUser.assignedScope || 'all')) {
      membershipMatchStages.push(
        {
          $lookup: {
            from: 'womenmembers',
            localField: 'memberId',
            foreignField: '_id',
            as: 'member'
          }
        },
        { $unwind: '$member' }
      );
      
      const filters: any[] = [];
      if (dbUser.assignedStates?.length) filters.push({ 'member.state': { $in: dbUser.assignedStates } });
      if (dbUser.assignedDistricts?.length) filters.push({ 'member.district': { $in: dbUser.assignedDistricts } });
      if (dbUser.assignedBlocks?.length) filters.push({ 'member.block': { $in: dbUser.assignedBlocks } });
      if (filters.length > 0) {
        membershipMatchStages.push({ $match: { $or: filters } });
      }
    }

    membershipMatchStages.push(
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    );
    const monthlyCollections = await Membership.aggregate(membershipMatchStages);

    // Employee performance (members added by each employee)
    const employeePerfStages: any[] = [];
    if (Object.keys(regionalMatch).length > 0) {
      employeePerfStages.push({ $match: regionalMatch });
    }
    employeePerfStages.push(
      {
        $group: {
          _id: "$createdBy",
          membersCount: { $sum: 1 }
        }
      },
      { $sort: { membersCount: -1 } },
      { $limit: 10 }
    );
    const employeePerformance = await WomenMember.aggregate(employeePerfStages);

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
