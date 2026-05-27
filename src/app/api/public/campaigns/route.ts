import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import { successResponse, errorResponse } from '@/utils/response';
import { translateDynamicData } from '@/lib/server-translate';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const campaigns = await Campaign.find({ status: 'active' }).sort({ createdAt: -1 });
    
    const lang = req.headers.get('x-language') || 'en';
    const translatedCampaigns = await translateDynamicData(campaigns, lang, ['title', 'description', 'targetAudience']);
    
    return successResponse(translatedCampaigns);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
