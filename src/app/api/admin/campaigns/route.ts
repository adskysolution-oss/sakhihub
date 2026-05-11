import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const campaigns = await Campaign.find({ status: 'active' }).sort({ createdAt: -1 });
    
    return successResponse(campaigns);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const body = await req.json();
    
    const campaign = await Campaign.create({
      ...body,
      referralLink: `/register?campaign=${Math.random().toString(36).substr(2, 9)}` // Initial base link
    });

    // Update with real ID-based link if needed, or keep unique hash
    campaign.referralLink = `/register?campaignId=${campaign._id}`;
    await campaign.save();
    
    return successResponse(campaign, 'Campaign launched successfully with referral mapping', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
