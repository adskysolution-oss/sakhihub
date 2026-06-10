import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import EmailLog from '@/models/EmailLog';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();

    // 1. Core counters
    const totalSent = await EmailLog.countDocuments({ type: 'campaign' });
    const totalDelivered = await EmailLog.countDocuments({ type: 'campaign', delivered: true });
    const totalFailed = await EmailLog.countDocuments({ type: 'campaign', failed: true });
    const totalOpened = await EmailLog.countDocuments({ type: 'campaign', opened: true });
    const totalClicked = await EmailLog.countDocuments({ type: 'campaign', clicked: true });

    const activeCampaigns = await EmailCampaign.countDocuments({ status: 'sending' });
    const scheduledCampaigns = await EmailCampaign.countDocuments({ status: 'scheduled' });

    // Calculate rates
    const openRate = totalDelivered > 0 ? parseFloat(((totalOpened / totalDelivered) * 100).toFixed(2)) : 0;
    const clickRate = totalDelivered > 0 ? parseFloat(((totalClicked / totalDelivered) * 100).toFixed(2)) : 0;
    const deliveryRate = totalSent > 0 ? parseFloat(((totalDelivered / totalSent) * 100).toFixed(2)) : 0;

    // 2. Daily volume (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyVolume = await EmailLog.aggregate([
      {
        $match: {
          type: 'campaign',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sent: { $sum: 1 },
          delivered: { $sum: { $cond: ["$delivered", 1, 0] } },
          failed: { $sum: { $cond: ["$failed", 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Weekly volume (Last 4 Weeks)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const weeklyVolume = await EmailLog.aggregate([
      {
        $match: {
          type: 'campaign',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $concat: [
              "Week ",
              { $toString: { $week: "$createdAt" } }
            ]
          },
          sent: { $sum: 1 },
          delivered: { $sum: { $cond: ["$delivered", 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Monthly volume (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyVolume = await EmailLog.aggregate([
      {
        $match: {
          type: 'campaign',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          sent: { $sum: 1 },
          delivered: { $sum: { $cond: ["$delivered", 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 5. Top performing campaigns (highest delivery volume/rates)
    const topCampaigns = await EmailCampaign.find({ status: 'completed' })
      .sort({ recipientCount: -1 })
      .limit(5)
      .lean();

    return successResponse({
      summary: {
        totalSent,
        totalDelivered,
        totalFailed,
        totalOpened,
        totalClicked,
        openRate,
        clickRate,
        deliveryRate,
        activeCampaigns,
        scheduledCampaigns
      },
      charts: {
        daily: dailyVolume,
        weekly: weeklyVolume,
        monthly: monthlyVolume
      },
      topCampaigns
    });
  } catch (error: any) {
    console.error('[ANALYTICS_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
