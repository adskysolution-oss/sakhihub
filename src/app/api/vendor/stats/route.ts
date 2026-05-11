import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import WomenMember from '@/models/WomenMember';
import SecurityDeposit from '@/models/SecurityDeposit';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const vendorId = (session as any).id;
    const user = await User.findById(vendorId);

    if (!user || !user.vendorCode) return errorResponse('Vendor profile not found', 404);

    const vendorCode = user.vendorCode;

    // Fetch Stats with Hierarchy Filtering
    const [
      activeCampaigns,
      totalEmployees,
      totalSubVendors,
      totalMembers,
      paidMembers,
      freeMembers,
      deposits
    ] = await Promise.all([
      Campaign.countDocuments({ assignedVendors: vendorId, status: 'active' }),
      User.countDocuments({ parentVendorId: vendorId, role: 'employee' }),
      User.countDocuments({ parentVendorId: vendorId, role: 'sub_vendor' }),
      WomenMember.countDocuments({ vendorCode: vendorCode }),
      WomenMember.countDocuments({ vendorCode: vendorCode, membershipStatus: 'paid' }),
      WomenMember.countDocuments({ vendorCode: vendorCode, membershipStatus: 'free' }),
      SecurityDeposit.find({ vendorId: vendorId }).populate('campaignId', 'title')
    ]);

    const stats = {
      activeCampaigns,
      totalEmployees,
      totalSubVendors,
      totalMembers,
      paidMembers,
      freeMembers,
      deposits: deposits.map((d: any) => ({
        campaignName: d.campaignId?.title || 'N/A',
        amount: d.amount,
        status: d.paymentStatus
      }))
    };

    return successResponse(stats);
  } catch (error: any) {
    console.error('Vendor Stats Error:', error);
    return errorResponse(error.message, 500);
  }
}
