import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadBuffer } from '@/lib/storage';

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const formData = await req.formData();
    const campaignId = formData.get('id')?.toString();

    if (!campaignId) {
      return errorResponse('Campaign ID is required for update', 400);
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Process image upload if new banner exists
    let bannerImageUrl = campaign.bannerImage;
    const bannerFile = formData.get('bannerImage') as File;
    
    if (bannerFile && bannerFile.size > 0) {
      const arrayBuffer = await bannerFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const folderName = `sakhihub/campaigns/${formData.get('title')?.toString().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'default'}`;
      
      const uploadResult = await uploadBuffer(
        buffer,
        bannerFile.type,
        folderName,
        {
          uploadedBy: (session as any).id,
          uploadedFor: 'campaignBannerUpdate',
          originalName: bannerFile.name
        }
      );
      bannerImageUrl = uploadResult.url;
    }

    // Update visibility and fields
    campaign.title = formData.get('title') || campaign.title;
    campaign.description = formData.get('description') || campaign.description;
    campaign.targetAudience = formData.get('targetAudience') || campaign.targetAudience;
    campaign.location = formData.get('location') || campaign.location;
    campaign.charges = formData.get('charges') ? Number(formData.get('charges')) : campaign.charges;
    campaign.status = formData.get('status') || campaign.status;
    campaign.startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string) : campaign.startDate;
    campaign.endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string) : undefined;
    campaign.bannerImage = bannerImageUrl;

    campaign.visibilityOptions = {
      hideChargesFromSubVendors: formData.get('hideChargesFromSubVendors') === 'true',
      hideTargetDetailsFromEmployees: formData.get('hideTargetDetailsFromEmployees') === 'true'
    };

    // Update assigned vendors
    const vendorsJson = formData.get('assignedVendors')?.toString();
    if (vendorsJson) {
      campaign.assignedVendors = JSON.parse(vendorsJson);
    }

    await campaign.save();
    return successResponse(campaign, 'Campaign updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
