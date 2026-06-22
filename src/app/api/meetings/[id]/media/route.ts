import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GroupMeeting from '@/models/GroupMeeting';
import MeetingMedia from '@/models/MeetingMedia';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const userId = (session as any).id || (session as any).userId;
    const role = (session as any).role;

    await dbConnect();

    const meeting = await GroupMeeting.findById(id);
    if (!meeting) return errorResponse('Meeting not found', 404);

    // Permission check: Can only attach media to own conducted meetings
    if (role === 'employee' && meeting.conductedBy.toString() !== userId) {
      return errorResponse('Forbidden: You can only upload evidence for meetings you conducted', 403);
    }

    const body = await req.json();
    const { type, url, thumbnailUrl, size, duration, latitude, longitude, capturedAt } = body;

    if (!type || !url) {
      return errorResponse('Media type and URL are required', 400);
    }

    if (!['photo', 'video'].includes(type)) {
      return errorResponse('Invalid media type. Must be photo or video.', 400);
    }

    // Create the detailed media record
    const media = await MeetingMedia.create({
      meetingId: new mongoose.Types.ObjectId(id),
      groupId: meeting.groupId,
      type,
      url,
      thumbnailUrl,
      size,
      duration,
      uploadedBy: new mongoose.Types.ObjectId(userId),
      uploadedAt: new Date(),
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      capturedAt: capturedAt ? new Date(capturedAt) : new Date()
    });

    // Update parent counters on GroupMeeting
    if (type === 'photo') {
      meeting.photoCount = (meeting.photoCount || 0) + 1;
    } else {
      meeting.videoCount = (meeting.videoCount || 0) + 1;
    }
    await meeting.save();

    return successResponse(media, 'Media evidence attached to meeting successfully', 201);

  } catch (error: any) {
    console.error('Save meeting media POST error:', error);
    return errorResponse(error.message || 'Failed to save media record', 500);
  }
}
