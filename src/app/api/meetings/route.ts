import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GroupMeeting from '@/models/GroupMeeting';
import Group from '@/models/Group';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const userId = (session as any).id || (session as any).userId;
    const role = (session as any).role;

    if (!['employee', 'super_admin'].includes(role)) {
      return errorResponse('Forbidden: Only employees or admins can record meetings', 403);
    }

    await dbConnect();
    const body = await req.json();
    const { groupId, meetingDate, remarks, village, block, district, attendees = [] } = body;

    if (!groupId) {
      return errorResponse('Group ID is required', 400);
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse('Group not found', 404);
    }

    // Permission check for employees: Can only create meetings for their own groups
    if (role === 'employee' && group.createdBy.toString() !== userId) {
      return errorResponse('Forbidden: You can only conduct meetings for groups you created', 403);
    }

    // Ensure Campaign model is registered
    const _Campaign = Campaign;

    // Build meeting data, pre-populating fields from Group if not provided
    const meetingData = {
      groupId,
      campaignId: group.campaignId || undefined,
      conductedBy: userId,
      meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
      village: village || group.village,
      block: block || group.block,
      district: district || group.district,
      vendorCode: group.vendorCode,
      subVendorCode: group.subVendorCode,
      remarks,
      attendeesCount: attendees.length,
      attendees: attendees.map((id: string) => new mongoose.Types.ObjectId(id)),
      status: 'draft', // Starts as draft to upload media
      photoCount: 0,
      videoCount: 0
    };

    const meeting = await GroupMeeting.create(meetingData);

    return successResponse(meeting, 'Meeting created in draft state successfully', 201);
  } catch (error: any) {
    console.error('Meeting POST error:', error);
    return errorResponse(error.message || 'Failed to create meeting', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const userId = (session as any).id || (session as any).userId;
    const role = (session as any).role;

    await dbConnect();

    // Fetch user profile for regional or hierarchy scope matching
    const User = (await import('@/models/User')).default;
    const userProfile = await User.findById(userId);

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const conductedBy = searchParams.get('conductedBy');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const block = searchParams.get('block');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any = {};

    // 1. Role-based scoping
    if (role === 'employee') {
      query.conductedBy = userId;
    } else if (role === 'vendor') {
      query.vendorCode = userProfile?.vendorCode;
    } else if (role === 'sub_vendor') {
      query.subVendorCode = userProfile?.subVendorCode;
    } else if (role === 'operations_admin' || role === 'staff') {
      if (userProfile?.assignedScope === 'regional') {
        const regionalFilter: any = {};
        if (userProfile.assignedStates?.length) {
          regionalFilter.state = { $in: userProfile.assignedStates };
        }
        if (userProfile.assignedDistricts?.length) {
          regionalFilter.district = { $in: userProfile.assignedDistricts };
        }
        if (userProfile.assignedBlocks?.length) {
          regionalFilter.block = { $in: userProfile.assignedBlocks };
        }
        // Merge regional filters
        query = { ...query, ...regionalFilter };
      }
    } else if (role !== 'super_admin') {
      return errorResponse('Forbidden', 403);
    }

    // 2. Apply query filters
    if (groupId) query.groupId = groupId;
    if (conductedBy) query.conductedBy = conductedBy;
    if (state) query.state = state;
    if (district) query.district = district;
    if (block) query.block = block;
    if (status) query.status = status;

    // 3. Date range filtering on meetingDate
    if (startDate || endDate) {
      query.meetingDate = {};
      if (startDate) query.meetingDate.$gte = new Date(startDate);
      if (endDate) query.meetingDate.$lte = new Date(endDate);
    }

    // Ensure models are registered for population
    const _Group = Group;
    const _Campaign = Campaign;

    // 4. Fetch total & results
    const [total, data] = await Promise.all([
      GroupMeeting.countDocuments(query),
      GroupMeeting.find(query)
        .sort({ meetingDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('groupId', 'groupName village block district leaderName')
        .populate('conductedBy', 'fullName employeeId')
        .populate('campaignId', 'title')
    ]);

    return successResponse({
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Meetings GET error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
