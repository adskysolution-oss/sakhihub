import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GroupMeeting from '@/models/GroupMeeting';
import MeetingMedia from '@/models/MeetingMedia';
import Group from '@/models/Group';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const userId = (session as any).id || (session as any).userId;
    const role = (session as any).role;

    if (!['employee', 'super_admin'].includes(role)) {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date'); // Expects YYYY-MM-DD
    
    if (!dateStr) {
      return errorResponse('Date parameter (YYYY-MM-DD) is required', 400);
    }

    await dbConnect();

    // Parse date range (start of day to end of day in UTC/Local)
    const startDate = new Date(`${dateStr}T00:00:00.000Z`);
    const endDate = new Date(`${dateStr}T23:59:59.999Z`);

    // Fetch stats in parallel for efficiency
    const [meetings, groupsCreatedCount, membersAddedCount, mediaFiles] = await Promise.all([
      // 1. Group meetings conducted on this date by employee (excluding draft status)
      GroupMeeting.find({
        conductedBy: userId,
        meetingDate: { $gte: startDate, $lte: endDate },
        status: { $ne: 'draft' }
      }).select('attendeesCount'),

      // 2. Groups created by employee on this date
      Group.countDocuments({
        createdBy: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // 3. Women members registered by employee on this date
      WomenMember.countDocuments({
        createdBy: userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // 4. Photos & Videos uploaded on this date by employee
      MeetingMedia.find({
        uploadedBy: userId,
        uploadedAt: { $gte: startDate, $lte: endDate }
      }).select('type url')
    ]);

    // Aggregate dynamic statistics
    const meetingCount = meetings.length;
    const membersAttended = meetings.reduce((sum, m) => sum + (m.attendeesCount || 0), 0);
    
    const photos = mediaFiles.filter(m => m.type === 'photo').map(m => m.url);
    const videosCount = mediaFiles.filter(m => m.type === 'video').length;

    return successResponse({
      date: dateStr,
      meetingCount,
      groupsCreated: groupsCreatedCount,
      membersAdded: membersAddedCount,
      membersAttended,
      photos,
      videosCount
    }, 'Stats compiled successfully');

  } catch (error: any) {
    console.error('Reports Daily Stats Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
