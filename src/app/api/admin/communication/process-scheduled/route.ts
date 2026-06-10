import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduledCampaign from '@/models/ScheduledCampaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { CampaignQueue } from '@/lib/queue';

export async function POST(req: NextRequest) {
  try {
    // Schedulers can call this with either Super Admin auth or a cron secret token
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'sakhi-hub-cron-secret-key-2026';
    
    let isAuthorized = false;

    if (authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      const session = await getAuthSession();
      if (session && (session as any).role === 'super_admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();

    // Query pending scheduled campaigns that should have run by now
    const now = new Date();
    const pending = await ScheduledCampaign.find({
      status: 'pending',
      scheduledAt: { $lte: now }
    });

    console.log(`[SCHEDULE-CRON] Found ${pending.length} scheduled campaigns ready to process.`);
    const processed = [];

    for (const item of pending) {
      try {
        item.status = 'processing';
        await item.save();

        // Dispatch immediately
        await CampaignQueue.addCampaign(item.campaignId.toString());

        item.status = 'completed';
        await item.save();

        processed.push(item._id.toString());
      } catch (err: any) {
        item.status = 'failed';
        item.error = err.message || 'Error processing scheduled campaign';
        await item.save();
        console.error(`[SCHEDULE-CRON] Failed to process scheduled item: ${item._id}`, err);
      }
    }

    return successResponse({
      message: `Processed ${processed.length} scheduled campaigns`,
      processedCampaigns: processed
    });
  } catch (error: any) {
    console.error('[CRON_PROCESS_SCHEDULED] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
