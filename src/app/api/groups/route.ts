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
    
    const group = await Group.create({
      ...body,
      createdBy: (session as any).id,
    });

    return successResponse(group, 'Group created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
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
