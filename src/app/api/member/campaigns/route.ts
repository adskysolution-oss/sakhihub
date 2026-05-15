import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const memberId = (session as any).id;
    const member = await User.findById(memberId);
    if (!member?.parentVendorId) return errorResponse('No parent employee assigned', 400);

    const parentId = member.parentVendorId.toString();

    const allCampaigns = await Campaign.find({ status: 'active' });

    const assigned: any[] = [];
    const requested: any[] = [];
    const available: any[] = [];

    allCampaigns.forEach((c) => {
      // Check if parent (Employee) has access
      const parentAssignment = c.assignments?.find((a: any) => a.userId.toString() === parentId);
      const parentHasAccess = parentAssignment && ['assigned', 'approved', 'active'].includes(parentAssignment.status);

      if (parentHasAccess) {
        // Strip sensitive data completely for members
        const campaignData = c.toObject();
        delete campaignData.charges;
        delete campaignData.securityDeposit;
        delete campaignData.salaryStructure;
        delete campaignData.targetDetails;
        delete campaignData.visibilityOptions;

        const memberAssignment = c.assignments?.find((a: any) => a.userId.toString() === memberId);
        
        if (memberAssignment?.status === 'active' || memberAssignment?.status === 'approved' || memberAssignment?.status === 'assigned') {
          assigned.push({ ...campaignData, currentStatus: 'assigned' });
        } else if (memberAssignment?.status === 'requested') {
          requested.push({ ...campaignData, currentStatus: 'requested' });
        } else {
          available.push({ ...campaignData, currentStatus: 'available' });
        }
      }
    });

    return successResponse({ assigned, requested, available });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'member') return errorResponse('Unauthorized', 403);

    const memberId = (session as any).id;
    const body = await req.json();
    const { campaignId } = body;

    await dbConnect();
    
    const member = await User.findById(memberId);
    if (!member?.parentVendorId) return errorResponse('No parent assigned', 400);

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return errorResponse('Campaign not found', 404);

    const existingRequest = campaign.assignments?.find((a: any) => a.userId.toString() === memberId);
    if (existingRequest) {
      return errorResponse('You have already requested or been assigned this campaign.', 400);
    }

    if (!campaign.assignments) campaign.assignments = [];
    
    campaign.assignments.push({
      userId: memberId,
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
