import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    console.log('Group Creation Payload:', body);
    
    const mongoose = (await import('mongoose')).default;
    
    const groupData = {
      ...body,
      meetingDate: new Date(body.meetingDate),
      createdBy: new mongoose.Types.ObjectId((session as any).id)
    };

    if (body.campaignId && body.campaignId !== 'temp') {
      groupData.campaignId = new mongoose.Types.ObjectId(body.campaignId);
    } else {
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
