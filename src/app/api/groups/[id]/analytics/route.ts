import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import GroupMeeting from '@/models/GroupMeeting';
import MeetingMedia from '@/models/MeetingMedia';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const role = (session as any).role;
    const userId = (session as any).id;

    // Ensure models are registered for populating
    const _User = User;
    const _GroupMeeting = GroupMeeting;
    const _MeetingMedia = MeetingMedia;

    const group = await Group.findById(id).populate('createdBy', 'fullName employeeId status');
    if (!group) return errorResponse('Group not found', 404);

    // Permission check
    if (role === 'employee' && group.createdBy._id.toString() !== userId) {
      return errorResponse('Forbidden', 403);
    }

    const groupId = new mongoose.Types.ObjectId(id);

    // Run aggregations and queries in parallel
    const [membersData, financialData, meetings, media] = await Promise.all([
      // Member Stats
      WomenMember.aggregate([
        { $match: { groupId } },
        {
          $group: {
            _id: null,
            totalMembers: { $sum: 1 },
            paidMembers: { $sum: { $cond: [{ $eq: ['$membershipStatus', 'paid'] }, 1, 0] } },
            freeMembers: { $sum: { $cond: [{ $eq: ['$membershipStatus', 'free'] }, 1, 0] } },
            connectedMembers: { $sum: { $cond: [{ $eq: ['$connectionStatus', 'connected'] }, 1, 0] } }
          }
        }
      ]),
      // Financial Stats
      Membership.aggregate([
        { $match: { groupId, paymentStatus: 'Paid' } },
        {
          $group: {
            _id: null,
            totalCollection: { $sum: '$amount' },
            verifiedPayments: { $sum: 1 }
          }
        }
      ]),
      // Fetch group meetings
      GroupMeeting.find({ groupId })
        .populate('conductedBy', 'fullName employeeId')
        .sort({ meetingDate: -1 }),
      // Fetch media items
      MeetingMedia.find({ groupId }).sort({ createdAt: -1 })
    ]);

    const memberStats = membersData[0] || { totalMembers: 0, paidMembers: 0, freeMembers: 0, connectedMembers: 0 };
    const financeStats = financialData[0] || { totalCollection: 0, verifiedPayments: 0 };

    // Fetch recently added members
    const recentMembers = await WomenMember.find({ groupId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name mobile village membershipStatus createdAt');

    // Sign media URLs
    const { signMediaUrl } = await import('@/lib/s3');
    const signedMedia = await Promise.all(
      media.map(async (item) => {
        const obj = item.toObject();
        try {
          obj.url = await signMediaUrl(obj.url);
          if (obj.thumbnailUrl) {
            obj.thumbnailUrl = await signMediaUrl(obj.thumbnailUrl);
          }
        } catch (err) {
          console.error(`S3 signing failed for media ID ${item._id}:`, err);
        }
        return obj;
      })
    );

    const totalPhotos = media.filter((m) => m.type === 'photo').length;
    const totalVideos = media.filter((m) => m.type === 'video').length;

    return successResponse({
      group,
      stats: {
        ...memberStats,
        ...financeStats,
        totalMeetings: meetings.length,
        totalPhotos,
        totalVideos
      },
      recentMembers,
      meetings,
      media: signedMedia
    });
  } catch (error: any) {
    console.error('Group Analytics GET Error:', error);
    return errorResponse(error.message, 500);
  }
}

