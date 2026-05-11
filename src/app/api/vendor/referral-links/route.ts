import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
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
    const vendor = await User.findById(vendorId).populate('assignedCampaigns');

    if (!vendor || !vendor.vendorCode) return errorResponse('Vendor profile not found', 404);

    const campaigns = await Campaign.find({ assignedVendors: vendorId, status: 'active' });

    const links = campaigns.map((c: any) => ({
      campaignName: c.title,
      campaignId: c._id,
      employeeLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?role=employee&vendor=${vendor.vendorCode}&campaign=${c._id}`,
      memberLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?role=member&vendor=${vendor.vendorCode}&campaign=${c._id}`,
      subVendorLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?role=sub_vendor&vendor=${vendor.vendorCode}&campaign=${c._id}`,
    }));

    return successResponse(links);
  } catch (error: any) {
    console.error('Referral Links Error:', error);
    return errorResponse(error.message, 500);
  }
}
