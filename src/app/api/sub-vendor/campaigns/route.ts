import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const subVendorId = (session as any).id;
    const subVendor = await User.findById(subVendorId);
    if (!subVendor?.parentVendorId) return errorResponse('No parent vendor assigned', 400);

    const parentId = subVendor.parentVendorId.toString();

    // Active campaigns available for recruitment
    const allCampaigns = await Campaign.find({ status: 'active' });

    const assigned: any[] = [];
    const requested: any[] = [];
    const available: any[] = [];

    allCampaigns.forEach((c) => {
      // Check if parent vendor has access
      const parentAssignment = c.assignments?.find((a: any) => a.userId.toString() === parentId);
      const parentDirect = c.assignedVendors?.some((id: any) => id.toString() === parentId);
      const parentHasAccess = parentDirect || (parentAssignment && ['assigned', 'approved', 'active'].includes(parentAssignment.status));

      if (parentHasAccess) {
        // Strip sensitive data based on visibility options
        // ALWAYS Strip sensitive data for sub-vendors as per requirements
        const campaignData = c.toObject();
        delete campaignData.charges;
        delete campaignData.securityDeposit;
        delete campaignData.salaryStructure;
        delete campaignData.targetDetails;

        const subAssignment = c.assignments?.find((a: any) => a.userId.toString() === subVendorId);
        
        if (subAssignment?.status === 'active' || subAssignment?.status === 'approved' || subAssignment?.status === 'assigned') {
          assigned.push({ ...campaignData, currentStatus: 'assigned' });
        } else if (subAssignment?.status === 'requested') {
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

// Sub-Vendor requests a campaign from their Parent Vendor
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') return errorResponse('Unauthorized', 403);

    const subVendorId = (session as any).id;
    const body = await req.json();
    const { campaignId } = body;

    await dbConnect();
    
    const subVendor = await User.findById(subVendorId);
    if (!subVendor?.parentVendorId) return errorResponse('No parent vendor assigned', 400);

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return errorResponse('Campaign not found', 404);

    const existingRequest = campaign.assignments?.find((a: any) => a.userId.toString() === subVendorId);
    if (existingRequest) {
      return errorResponse('You have already requested or been assigned this campaign.', 400);
    }

    if (!campaign.assignments) campaign.assignments = [];
    
    campaign.assignments.push({
      userId: subVendorId,
      status: 'requested',
      requestedAt: new Date(),
      updatedAt: new Date()
    });

    await campaign.save();

    return successResponse(null, 'Campaign request submitted to your vendor successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
