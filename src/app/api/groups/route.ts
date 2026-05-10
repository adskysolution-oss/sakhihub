import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import Campaign from '@/models/Campaign';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    
    if (!(session as any).id) {
      return errorResponse('Session error: User ID missing', 400);
    }
    
    const groupData = {
      ...body,
      meetingDate: body.meetingDate ? new Date(body.meetingDate) : new Date(),
      createdBy: (session as any).id
    };

    if (body.campaignId === 'temp' || !body.campaignId) {
      delete groupData.campaignId;
    }
    
    const group = await Group.create(groupData);

    return successResponse(group, 'Group created successfully', 201);
  } catch (error: any) {
    console.error('Group Creation API Error:', error);
    return errorResponse(error.message || 'Failed to create group', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const role = (session as any).role;
    const userId = (session as any).id;

    let query = {};
    if (role === 'employee') {
      query = { createdBy: userId };
    }

    const groups = await Group.find(query).sort({ createdAt: -1 }).populate('campaignId', 'title');
    return successResponse(groups);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
import WomenMember from '@/models/WomenMember';

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Group ID required', 400);

    await dbConnect();
    const userId = (session as any).id;
    const role = (session as any).role;

    const group = await Group.findById(id);
    if (!group) return errorResponse('Group not found', 404);

    // Permission check
    if (role !== 'super_admin' && group.createdBy.toString() !== userId) {
      return errorResponse('Forbidden: You can only delete groups you created', 403);
    }

    // Handle Cascading Integrity: Update members in this group
    await WomenMember.updateMany(
      { groupId: id },
      { $set: { groupId: null, connectionStatus: 'unassigned' } }
    );

    await Group.findByIdAndDelete(id);

    return successResponse(null, 'Group deleted and members released successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
