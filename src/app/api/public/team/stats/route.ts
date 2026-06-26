import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import CoreTeamMember from '@/models/CoreTeamMember';
import { successResponse, errorResponse } from '@/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Query active and public-visible users in operational roles
    const users = await User.find({
      role: { $in: ['vendor', 'sub_vendor', 'staff', 'employee'] },
      status: { $in: ['active', 'approved'] },
      isPublicVisible: { $ne: false }
    }).select('role district state');

    // Query dynamic core team members
    let coreMembers: any[] = [];
    try {
      coreMembers = await CoreTeamMember.find({ isPublicVisible: true }).select('state district role');
    } catch (e) {
      console.error('Failed to query core team members in stats:', e);
    }

    const allStates = [...users.map(u => u.state), ...coreMembers.map(m => m.state)].filter(Boolean);
    const allDistricts = [...users.map(u => u.district), ...coreMembers.map(m => m.district)].filter(Boolean);

    const activeStatesList = Array.from(new Set(allStates)).sort() as string[];
    const activeDistrictsList = Array.from(new Set(allDistricts)).sort() as string[];

    const stats = {
      totalTeamMembers: users.length + coreMembers.length,
      activeDistricts: activeDistrictsList.length,
      activeStates: activeStatesList.length,
      vendors: users.filter(u => u.role === 'vendor').length,
      subVendors: users.filter(u => u.role === 'sub_vendor').length,
      staff: users.filter(u => u.role === 'staff').length,
      employees: users.filter(u => u.role === 'employee').length,
      founders: coreMembers.filter(m => m.role === 'founder').length
    };

    return successResponse({
      stats,
      activeStates: activeStatesList,
      activeDistricts: activeDistrictsList
    });
  } catch (error: any) {
    console.error('Public Team Stats API Error:', error);
    return errorResponse(error.message || 'Failed to fetch team stats', 500);
  }
}
