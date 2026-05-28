import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadBuffer } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const campaigns = await Campaign.find({})
      .populate({
        path: 'assignments.userId',
        select: 'fullName role vendorCode subVendorCode email',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'assignments.assignedBy',
        select: 'fullName role',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .lean(); // Using lean() for better performance and to avoid circular refs
    
    return successResponse(campaigns);
  } catch (error: any) {
    console.error("Admin Campaigns GET Error:", error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const formData = await req.formData();
    
    let bannerImageUrl = '';
    const bannerFile = formData.get('bannerImage') as File;
    
    if (bannerFile) {
      const arrayBuffer = await bannerFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const folderName = `sakhihub/campaigns/${formData.get('title')?.toString().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'default'}`;
      
      const uploadResult = await uploadBuffer(
        buffer,
        bannerFile.type,
        folderName,
        {
          uploadedBy: (session as any).id,
          uploadedFor: 'campaignBanner',
          originalName: bannerFile.name
        }
      );
      bannerImageUrl = uploadResult.url;
    }

    const visibilityOptions = {
      hideChargesFromSubVendors: formData.get('hideChargesFromSubVendors') === 'true',
      hideTargetDetailsFromEmployees: formData.get('hideTargetDetailsFromEmployees') === 'true'
    };

    const campaign = await Campaign.create({
      title: formData.get('title'),
      description: formData.get('description'),
      targetAudience: formData.get('targetAudience'),
      location: formData.get('location'),
      charges: formData.get('charges') ? Number(formData.get('charges')) : 0,
      status: formData.get('status') || 'active',
      bannerImage: bannerImageUrl,
      visibilityOptions,
      referralLink: `/register?campaign=${Math.random().toString(36).substr(2, 9)}` // Initial base link
    });

    // Update with real ID-based link if needed, or keep unique hash
    campaign.referralLink = `/register?campaignId=${campaign._id}`;
    await campaign.save();
    
    return successResponse(campaign, 'Campaign launched successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return errorResponse('Campaign ID required', 400);
    
    await Campaign.findByIdAndDelete(id);
    return successResponse(null, 'Campaign deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
