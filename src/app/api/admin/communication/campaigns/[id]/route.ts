import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import ScheduledCampaign from '@/models/ScheduledCampaign';
import EmailLog from '@/models/EmailLog';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';
import { CampaignQueue } from '@/lib/queue';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await props.params;
    await dbConnect();

    // Dynamically calculate actual counts from EmailLog using unique recipients to prevent out-of-sync stats
    const [deliveredEmails, failedEmails, openedEmails, clickedEmails] = await Promise.all([
      EmailLog.find({
        campaignId: id,
        status: { $in: ['success', 'delivered', 'opened', 'clicked'] }
      }).distinct('recipient'),
      EmailLog.find({
        campaignId: id,
        status: 'failed'
      }).distinct('recipient'),
      EmailLog.find({
        campaignId: id,
        opened: true
      }).distinct('recipient'),
      EmailLog.find({
        campaignId: id,
        clicked: true
      }).distinct('recipient')
    ]);

    const deliveredSet = new Set(deliveredEmails);
    const uniqueFailedEmails = failedEmails.filter(email => !deliveredSet.has(email));

    const actualDelivered = deliveredEmails.length;
    const actualFailed = uniqueFailedEmails.length;
    const actualOpened = openedEmails.length;
    const actualClicked = clickedEmails.length;

    // Update the database document so the campaign document counts are always correct
    const campaign = await EmailCampaign.findByIdAndUpdate(
      id,
      {
        deliveredCount: actualDelivered,
        failedCount: actualFailed,
        openedCount: actualOpened,
        clickedCount: actualClicked
      },
      { new: true }
    )
      .populate('createdBy', 'fullName email')
      .lean();

    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    return successResponse(campaign);
  } catch (error: any) {
    console.error('[CAMPAIGN_DETAIL_GET] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await props.params;
    await dbConnect();
    const body = await req.json();
    const { status } = body;

    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Handle cancellation
    if (status === 'cancelled') {
      if (!['scheduled', 'sending'].includes(campaign.status)) {
        return errorResponse('Only scheduled or sending campaigns can be cancelled.', 400);
      }

      await CampaignQueue.cancelCampaign(id);
      
      // Update status in scheduled records
      await ScheduledCampaign.findOneAndUpdate(
        { campaignId: id, status: 'pending' },
        { status: 'failed', error: 'Cancelled by administrator' }
      );

      await logActivity('cancel_campaign', session.id, undefined, ipAddress, {
        campaignId: id,
        name: campaign.name
      });

      return successResponse({ message: 'Campaign cancelled successfully' });
    }

    // Handle resumption
    if (status === 'resume') {
      if (campaign.status === 'completed') {
        return errorResponse('Completed campaigns cannot be resumed.', 400);
      }

      // Explicitly change status to sending
      campaign.status = 'sending';
      await campaign.save();

      // Trigger resumption via queue
      await CampaignQueue.addCampaign(id);

      await logActivity('resume_campaign', session.id, undefined, ipAddress, {
        campaignId: id,
        name: campaign.name
      });

      return successResponse({ message: 'Campaign resumed successfully' });
    }

    // Handle retrying failed recipients
    if (status === 'retry_failed') {
      if (campaign.failedCount === 0) {
        return errorResponse('No failed recipients to retry.', 400);
      }

      // Keep existing failed logs for this campaign (they will be updated to pending on actual dispatch/send)

      // Reset the failed count, update status to sending, and clear completedAt
      campaign.failedCount = 0;
      campaign.status = 'sending';
      campaign.completedAt = undefined;
      await campaign.save();

      // Trigger the queue run (this automatically filters to remaining/failed recipients)
      await CampaignQueue.addCampaign(id);

      await logActivity('retry_failed_campaign', session.id, undefined, ipAddress, {
        campaignId: id,
        name: campaign.name
      });

      return successResponse({ message: 'Campaign retry initiated successfully for failed recipients' });
    }

    // Generic update
    const updated = await EmailCampaign.findByIdAndUpdate(id, body, { new: true });
    return successResponse(updated);

  } catch (error: any) {
    console.error('[CAMPAIGN_DETAIL_PATCH] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await props.params;
    await dbConnect();

    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    if (campaign.status !== 'draft') {
      return errorResponse('Only draft campaigns can be deleted.', 400);
    }

    await EmailCampaign.findByIdAndDelete(id);

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await logActivity('delete_campaign', session.id, undefined, ipAddress, {
      campaignId: id,
      name: campaign.name
    });

    return successResponse({ message: 'Draft campaign deleted successfully' });
  } catch (error: any) {
    console.error('[CAMPAIGN_DETAIL_DELETE] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
