import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { getCampaignRecipients } from '@/utils/audienceBuilder';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const { filters } = await req.json();

    // Fetch unified recipients
    const recipients = await getCampaignRecipients(filters);
    
    // Limit to 10 for preview
    const previewUsers = recipients.slice(0, 10);

    return successResponse({ preview: previewUsers });
  } catch (error: any) {
    console.error('[AUDIENCE_PREVIEW_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
