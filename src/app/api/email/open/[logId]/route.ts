import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailCampaign from '@/models/EmailCampaign';

export async function GET(req: NextRequest, props: { params: Promise<{ logId: string }> }) {
  try {
    const { logId } = await props.params;
    await dbConnect();

    const log = await EmailLog.findById(logId);
    if (log && !log.opened) {
      log.opened = true;
      log.openedAt = new Date();
      if (['success', 'delivered', 'pending'].includes(log.status)) {
        log.status = 'opened';
      }
      await log.save();

      if (log.campaignId) {
        await EmailCampaign.findByIdAndUpdate(log.campaignId, {
          $inc: { openedCount: 1 }
        });
      }
    }
  } catch (error) {
    console.error('[EMAIL_OPEN_TRACKING] Error:', error);
  }

  // Always return 1x1 transparent GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  return new Response(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
