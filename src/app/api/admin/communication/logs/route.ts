import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailCampaign from '@/models/EmailCampaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const campaignId = searchParams.get('campaignId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const query: any = {};

    if (campaignId) {
      query.campaignId = campaignId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await EmailLog.countDocuments(query);
    const logs = await EmailLog.find(query)
      .populate('campaignId', 'name')
      .populate('recipientUser', 'fullName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('[DELIVERY_LOGS_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
