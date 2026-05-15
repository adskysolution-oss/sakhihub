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
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const vendorId = (session as any).id;

    const campaigns = await Campaign.find({ status: 'active' });

    // Group campaigns based on vendor's assignment status
    const assigned: any[] = [];
    const requested: any[] = [];
    const available: any[] = [];

    campaigns.forEach((c) => {
      const assignment = c.assignments?.find((a: any) => a.userId.toString() === vendorId);
      const isDirectlyAssigned = c.assignedVendors?.some((id: any) => id.toString() === vendorId);

      if (isDirectlyAssigned || assignment?.status === 'active' || assignment?.status === 'approved' || assignment?.status === 'assigned') {
        assigned.push({ ...c.toObject(), currentStatus: 'assigned' });
      } else if (assignment?.status === 'requested') {
        requested.push({ ...c.toObject(), currentStatus: 'requested' });
      } else {
        available.push({ ...c.toObject(), currentStatus: 'available' });
      }
    });

    return successResponse({ assigned, requested, available });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

// Vendor requests a campaign from Admin
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') return errorResponse('Unauthorized', 403);

    const vendorId = (session as any).id;
    const body = await req.json();
    const { campaignId } = body;

    await dbConnect();
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return errorResponse('Campaign not found', 404);

    const existingRequest = campaign.assignments?.find((a: any) => a.userId.toString() === vendorId);
    if (existingRequest) {
      return errorResponse('You have already requested or been assigned this campaign.', 400);
    }

    if (!campaign.assignments) campaign.assignments = [];
    
    campaign.assignments.push({
      userId: vendorId,
      status: 'requested',
      requestedAt: new Date(),
      updatedAt: new Date()
    });

    await campaign.save();

    return successResponse(null, 'Campaign request submitted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
