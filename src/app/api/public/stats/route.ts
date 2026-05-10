import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import DailyReport from '@/models/DailyReport';
import { successResponse, errorResponse } from '@/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const [totalMembers, totalGroups, totalEmployees] = await Promise.all([
      WomenMember.countDocuments(),
      Group.countDocuments(),
      User.countDocuments({ role: 'employee', status: 'active' })
    ]);

    // Calculate reach (example: members + estimated impact)
    const totalImpact = (totalMembers * 5) + 12450; // Base impact + 5x members

    return successResponse({
      totalMembers,
      totalGroups,
      totalEmployees,
      totalImpact,
      reach: totalImpact + 5000 // Total reach including campaigns
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
