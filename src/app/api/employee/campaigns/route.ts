import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'employee') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const employeeId = (session as any).id;
    const employee = await User.findById(employeeId);
    if (!employee?.parentVendorId) return errorResponse('No parent sub-vendor assigned', 400);

    const parentId = employee.parentVendorId.toString();

    // Active campaigns available for recruitment
    const allCampaigns = await Campaign.find({ status: 'active' });

    const assigned: any[] = [];
    const requested: any[] = [];
    const available: any[] = [];

    allCampaigns.forEach((c) => {
      // Check if parent has access
      const parentAssignment = c.assignments?.find((a: any) => a.userId.toString() === parentId);
      const parentDirect = c.assignedVendors?.some((id: any) => id.toString() === parentId);
      const parentHasAccess = parentDirect || (parentAssignment && ['assigned', 'approved', 'active'].includes(parentAssignment.status));

      if (parentHasAccess) {
        // Strip sensitive data based on visibility options
        const campaignData = c.toObject();
        if (campaignData.visibilityOptions?.hideTargetDetailsFromEmployees) {
          delete campaignData.targetDetails;
        }
        // Always hide financial details from employees
        delete campaignData.charges;
        delete campaignData.securityDeposit;
        delete campaignData.salaryStructure;

        const employeeAssignment = c.assignments?.find((a: any) => a.userId.toString() === employeeId);
        
        if (employeeAssignment?.status === 'active' || employeeAssignment?.status === 'approved' || employeeAssignment?.status === 'assigned') {
          assigned.push({ ...campaignData, currentStatus: 'assigned' });
        } else if (employeeAssignment?.status === 'requested') {
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
    if (!session || (session as any).role !== 'employee') return errorResponse('Unauthorized', 403);

    const employeeId = (session as any).id;
    const body = await req.json();
    const { campaignId } = body;

    await dbConnect();
    
    const employee = await User.findById(employeeId);
    if (!employee?.parentVendorId) return errorResponse('No parent assigned', 400);

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return errorResponse('Campaign not found', 404);

    const existingRequest = campaign.assignments?.find((a: any) => a.userId.toString() === employeeId);
    if (existingRequest) {
      return errorResponse('You have already requested or been assigned this campaign.', 400);
    }

    if (!campaign.assignments) campaign.assignments = [];
    
    campaign.assignments.push({
      userId: employeeId,
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
