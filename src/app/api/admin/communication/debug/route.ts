import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduledCampaign from '@/models/ScheduledCampaign';
import EmailCampaign from '@/models/EmailCampaign';
import EmailLog from '@/models/EmailLog';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { CampaignQueue } from '@/lib/queue';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !['super_admin', 'admin'].includes((session as any).role)) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();

    // 1. Redis Connection Status
    const isRedisActive = CampaignQueue.isRedisActive();

    // 2. Queue metrics
    const queueMetrics = await CampaignQueue.getQueueMetrics();

    // 3. Worker metrics
    const workerMetrics = await CampaignQueue.getWorkerMetrics();

    // 4. Scheduled Jobs (Pending)
    const scheduledJobs = await ScheduledCampaign.find({ status: 'pending' })
      .select('campaignId scheduledAt status error')
      .lean();

    // 5. Stuck Campaigns
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeCampaigns = await EmailCampaign.find({ status: 'sending' }).lean();
    const stuckCampaigns = [];

    for (const campaign of activeCampaigns) {
      const lastLog = await EmailLog.findOne({ campaignId: campaign._id })
        .sort({ sentAt: -1 })
        .select('sentAt');

      const lastActivity = lastLog ? lastLog.sentAt : campaign.sentAt;
      if (lastActivity && new Date(lastActivity) < fiveMinutesAgo) {
        stuckCampaigns.push({
          campaignId: campaign._id.toString(),
          name: campaign.name,
          status: campaign.status,
          recipientCount: campaign.recipientCount,
          deliveredCount: campaign.deliveredCount,
          failedCount: campaign.failedCount,
          lastActivity
        });
      }
    }

    // 6. Pending Email Logs
    const pendingEmailLogsCount = await EmailLog.countDocuments({ status: 'pending' });

    // 7. Last Sent Email Timestamp
    const lastSentLog = await EmailLog.findOne({ status: 'success' })
      .sort({ sentAt: -1 })
      .select('sentAt');
    const lastSentEmailTimestamp = lastSentLog ? lastSentLog.sentAt : null;

    return successResponse({
      redisStatus: isRedisActive ? 'CONNECTED' : 'OFFLINE',
      queueStatus: queueMetrics,
      workerStatus: workerMetrics,
      scheduledJobsCount: scheduledJobs.length,
      scheduledJobs,
      stuckCampaignsCount: stuckCampaigns.length,
      stuckCampaigns,
      pendingEmailLogsCount,
      lastSentEmailTimestamp
    });
  } catch (error: any) {
    console.error('[COMMUNICATION_DEBUG_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
