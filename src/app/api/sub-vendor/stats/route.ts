import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const subVendorId = (session as any).id;
    const user = await User.findById(subVendorId);

    if (!user || !user.subVendorCode) return errorResponse('Sub-Vendor profile not found', 404);

    const subVendorCode = user.subVendorCode;

    // Fetch Stats with Hierarchy Filtering
    const [
      activeCampaigns,
      totalEmployees,
      totalMembers,
      totalGroups,
      paidMembers,
      freeMembers
    ] = await Promise.all([
      Campaign.countDocuments({ status: 'active' }), // Simplified for now, should be assigned campaigns
      User.countDocuments({ role: 'employee', subVendorCode: subVendorCode }),
      WomenMember.countDocuments({ subVendorCode: subVendorCode }),
      Group.countDocuments({ subVendorCode: subVendorCode }),
      WomenMember.countDocuments({ subVendorCode: subVendorCode, membershipStatus: 'paid' }),
      WomenMember.countDocuments({ subVendorCode: subVendorCode, membershipStatus: 'free' }),
    ]);

    const stats = {
      activeCampaigns,
      totalEmployees,
      totalMembers,
      totalGroups,
      paidMembers,
      freeMembers
    };

    return successResponse(stats);
  } catch (error: any) {
    console.error('Sub-Vendor Stats Error:', error);
    return errorResponse(error.message, 500);
  }
}
