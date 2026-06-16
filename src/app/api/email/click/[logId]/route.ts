import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import { recalculateCampaignCounts } from '@/lib/queue';

export async function GET(req: NextRequest, props: { params: Promise<{ logId: string }> }) {
  const { logId } = await props.params;
  const { searchParams } = new URL(req.url);
  const redirectUrl = searchParams.get('redirect') || 'https://www.sakhihub.com';

  try {
    await dbConnect();

    const log = await EmailLog.findById(logId);
    if (log && !log.clicked) {
      log.clicked = true;
      log.clickedAt = new Date();
      if (['success', 'delivered', 'opened', 'pending'].includes(log.status)) {
        log.status = 'clicked';
      }
      await log.save();

      if (log.campaignId) {
        await recalculateCampaignCounts(log.campaignId.toString());
      }
    }
  } catch (error) {
    console.error('[EMAIL_CLICK_TRACKING] Error:', error);
  }

  return NextResponse.redirect(redirectUrl, 302);
}
