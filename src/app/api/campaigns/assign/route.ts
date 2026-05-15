import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    // Allow admin to assign to vendor, OR vendor to assign to sub-vendor
    if (!session || !['super_admin', 'vendor'].includes((session as any).role)) {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const body = await req.json();
    const { campaignId, targetUserId, status } = body;
    // status can be 'assigned', 'approved', 'rejected'

    if (!campaignId || !targetUserId || !status) {
      return errorResponse('Missing required fields', 400);
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return errorResponse('Campaign not found', 404);

    // If vendor is assigning, ensure the vendor themselves has access to this campaign
    if ((session as any).role === 'vendor') {
      const vendorAssignment = campaign.assignments?.find((a: any) => a.userId.toString() === (session as any).id);
      const isDirectlyAssigned = campaign.assignedVendors?.some((id: any) => id.toString() === (session as any).id);
      if (!isDirectlyAssigned && (!vendorAssignment || !['assigned', 'approved', 'active'].includes(vendorAssignment.status))) {
         return errorResponse('You cannot assign a campaign you do not have access to', 403);
      }
    }

    if (!campaign.assignments) campaign.assignments = [];

    const assignmentIndex = campaign.assignments.findIndex((a: any) => a.userId.toString() === targetUserId);
    
    if (assignmentIndex >= 0) {
      // Update existing request
      campaign.assignments[assignmentIndex].status = status;
      campaign.assignments[assignmentIndex].assignedBy = (session as any).id;
      campaign.assignments[assignmentIndex].updatedAt = new Date();
    } else {
      // Direct assignment
      campaign.assignments.push({
        userId: targetUserId,
        status: status,
        assignedBy: (session as any).id,
        requestedAt: new Date(),
        updatedAt: new Date()
      });
    }

    await campaign.save();
    return successResponse(null, `Campaign successfully ${status}`);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
