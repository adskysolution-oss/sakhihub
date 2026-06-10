import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import ScheduledCampaign from '@/models/ScheduledCampaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';
import { CampaignQueue } from '@/lib/queue';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const total = await EmailCampaign.countDocuments(query);
    const campaigns = await EmailCampaign.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('[CAMPAIGNS_API_GET] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const body = await req.json();
    const { name, subject, content, filters, recipientCount, status, scheduledAt, attachments } = body;

    if (!name || !subject || !content) {
      return errorResponse('Name, subject, and email body are required.', 400);
    }

    const campaign = await EmailCampaign.create({
      name,
      subject,
      content,
      filters: filters || {},
      recipientCount: recipientCount || 0,
      status: status === 'scheduled' || status === 'sending' ? status : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      attachments: attachments || [],
      createdBy: session.id,
      channel: 'email'
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Queue or process immediately if user chose that option
    if (status === 'sending') {
      // Dispatch immediately
      await CampaignQueue.addCampaign(campaign._id.toString());
      await logActivity('send_campaign', session.id, undefined, ipAddress, {
        campaignId: campaign._id,
        name: campaign.name
      });
    } else if (status === 'scheduled' && scheduledAt) {
      const scheduledTime = new Date(scheduledAt);
      const delayMs = scheduledTime.getTime() - Date.now();

      // Store in ScheduledCampaign list
      await ScheduledCampaign.create({
        campaignId: campaign._id,
        scheduledAt: scheduledTime,
        status: 'pending'
      });

      // Pass delay to Queue Manager
      await CampaignQueue.addCampaign(campaign._id.toString(), delayMs > 0 ? delayMs : 0);

      await logActivity('schedule_campaign', session.id, undefined, ipAddress, {
        campaignId: campaign._id,
        name: campaign.name,
        scheduledAt: scheduledTime
      });
    } else {
      await logActivity('create_campaign', session.id, undefined, ipAddress, {
        campaignId: campaign._id,
        name: campaign.name
      });
    }

    return successResponse(campaign, 'Campaign created successfully', 201);
  } catch (error: any) {
    console.error('[CAMPAIGNS_API_POST] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
