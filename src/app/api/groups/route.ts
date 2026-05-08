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
