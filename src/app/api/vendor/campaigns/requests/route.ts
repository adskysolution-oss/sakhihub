import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const vendorId = (session as any).id;

    // Find all active campaigns
    const campaigns = await Campaign.find({ status: 'active' });
    
    // Find all sub-vendors and employees who report to this vendor
    const downline = await User.find({ parentVendorId: vendorId }).select('fullName role email mobile state district block area');
    const downlineIds = downline.map(u => u._id.toString());

    const pendingRequests: any[] = [];

    campaigns.forEach(c => {
      c.assignments?.forEach((a: any) => {
        if (a.status === 'requested' && downlineIds.includes(a.userId.toString())) {
          const user = downline.find(u => u._id.toString() === a.userId.toString());
          pendingRequests.push({
            campaignId: c._id,
            campaignTitle: c.title,
            userId: a.userId,
            userName: user?.fullName,
            userRole: user?.role,
            userEmail: user?.email,
            userMobile: user?.mobile,
            userLocation: `${user?.area || ''} ${user?.block || ''} ${user?.district || ''}`.trim(),
            requestedAt: a.requestedAt,
            status: a.status
          });
        }
      });
    });

    return successResponse(pendingRequests);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
