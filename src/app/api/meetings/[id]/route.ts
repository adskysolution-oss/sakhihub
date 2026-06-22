import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GroupMeeting from '@/models/GroupMeeting';
import MeetingMedia from '@/models/MeetingMedia';
import Group from '@/models/Group';
import Campaign from '@/models/Campaign';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { checkRegionalScope } from '@/utils/authHelpers';
import mongoose from 'mongoose';

export async function GET(
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

    // Ensure dependent models are registered
    const _Group = Group;
    const _Campaign = Campaign;
    const _WomenMember = WomenMember;

    const meeting = await GroupMeeting.findById(id)
      .populate('groupId', 'groupName village block district leaderName leaderMobile')
      .populate('conductedBy', 'fullName employeeId')
      .populate('campaignId', 'title')
      .populate('attendees', 'name mobile village block district membershipStatus connectionStatus');

    if (!meeting) return errorResponse('Meeting record not found', 404);

    // Authorization & Scope check
    if (role === 'employee' && meeting.conductedBy._id.toString() !== userId) {
      return errorResponse('Forbidden: You can only view meetings you conducted', 403);
    }
    
    if (['operations_admin', 'staff'].includes(role)) {
      const withinScope = await checkRegionalScope(meeting, session);
      if (!withinScope) {
        return errorResponse('Forbidden: Meeting lies outside your regional scope boundaries', 403);
      }
    }

    if (role === 'vendor' || role === 'sub_vendor') {
      const User = (await import('@/models/User')).default;
      const userProfile = await User.findById(userId);
      if (role === 'vendor' && meeting.vendorCode !== userProfile?.vendorCode) {
        return errorResponse('Forbidden', 403);
      }
      if (role === 'sub_vendor' && meeting.subVendorCode !== userProfile?.subVendorCode) {
        return errorResponse('Forbidden', 403);
      }
    }

    // Fetch matching evidence media records
    const media = await MeetingMedia.find({ meetingId: id }).sort({ createdAt: 1 });

    const { signMediaUrl } = await import('@/lib/s3');
    const signedMedia = await Promise.all(media.map(async (item) => {
      const obj = item.toObject();
      obj.url = await signMediaUrl(obj.url);
      if (obj.thumbnailUrl) {
        obj.thumbnailUrl = await signMediaUrl(obj.thumbnailUrl);
      }
      return obj;
    }));

    return successResponse({
      meeting,
      media: signedMedia
    });

  } catch (error: any) {
    console.error('Meeting detail GET error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

export async function PATCH(
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
    const body = await req.json();
    const { status, rejectionReason } = body;

    const meeting = await GroupMeeting.findById(id);
    if (!meeting) return errorResponse('Meeting not found', 404);

    // 1. Submit update (Employee status update)
    if (status === 'submitted') {
      if (role === 'employee' && meeting.conductedBy.toString() !== userId) {
        return errorResponse('Forbidden: You can only submit your own meetings', 403);
      }

      meeting.status = 'submitted';
      meeting.rejectionReason = undefined; // clear rejection if re-submitted
      await meeting.save();

      return successResponse(meeting, 'Meeting submitted successfully for review');
    }

    // 2. Review verification update (Admins only)
    if (['verified', 'rejected'].includes(status)) {
      if (!['super_admin', 'operations_admin', 'staff'].includes(role)) {
        return errorResponse('Forbidden: Only review staff and admins can verify or reject meetings', 403);
      }

      // Regional scope check for operations/staff reviews
      if (['operations_admin', 'staff'].includes(role)) {
        const withinScope = await checkRegionalScope(meeting, session);
        if (!withinScope) {
          return errorResponse('Forbidden: Target meeting lies outside your assigned scope', 403);
        }
      }

      meeting.status = status;
      if (status === 'verified') {
        meeting.verifiedBy = new mongoose.Types.ObjectId(userId);
        meeting.verifiedAt = new Date();
        meeting.rejectionReason = undefined;
      } else {
        meeting.rejectionReason = rejectionReason || 'Rejection reason not provided';
        meeting.verifiedBy = undefined;
        meeting.verifiedAt = undefined;
      }

      await meeting.save();

      return successResponse(meeting, `Meeting status updated to ${status} successfully`);
    }

    return errorResponse('Invalid status transition', 400);

  } catch (error: any) {
    console.error('Meeting status transition patch error:', error);
    return errorResponse(error.message || 'Failed to update status', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const userId = (session as any).id || (session as any).userId;
    const role = (session as any).role;

    if (role !== 'employee') {
      return errorResponse('Forbidden: Only employees can edit drafts or rejections', 403);
    }

    await dbConnect();
    const body = await req.json();
    const { meetingDate, remarks, village, block, district, attendees = [] } = body;

    const meeting = await GroupMeeting.findById(id);
    if (!meeting) return errorResponse('Meeting not found', 404);

    if (meeting.conductedBy.toString() !== userId) {
      return errorResponse('Forbidden: You can only edit meetings you conducted', 403);
    }

    // Only allow editing draft or rejected records
    if (!['draft', 'rejected'].includes(meeting.status)) {
      return errorResponse('Forbidden: You can only edit meetings in draft or rejected status', 400);
    }

    meeting.meetingDate = meetingDate ? new Date(meetingDate) : meeting.meetingDate;
    meeting.remarks = remarks !== undefined ? remarks : meeting.remarks;
    meeting.village = village || meeting.village;
    meeting.block = block || meeting.block;
    meeting.district = district || meeting.district;
    meeting.attendeesCount = attendees.length;
    meeting.attendees = attendees.map((aid: string) => new mongoose.Types.ObjectId(aid));
    
    // Automatically transition to submitted when updated/corrected
    meeting.status = 'submitted';
    meeting.rejectionReason = undefined;

    await meeting.save();

    return successResponse(meeting, 'Meeting updated and re-submitted successfully');

  } catch (error: any) {
    console.error('Meeting details PUT error:', error);
    return errorResponse(error.message || 'Failed to update meeting', 500);
  }
}
