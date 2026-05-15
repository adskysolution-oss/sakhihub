import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import Campaign from '@/models/Campaign'; // Ensure Campaign is registered
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const _Campaign = Campaign; // Touch model
    
    // Authorization check: Employees should only see their own groups
    const userId = (session as any).id;
    const role = (session as any).role;

    const group = await Group.findById(id).populate('campaignId', 'title');
    
    if (!group) {
      return errorResponse('Group not found', 404);
    }

    if (role === 'employee' && group.createdBy.toString() !== userId) {
      return errorResponse('Unauthorized access to this group', 403);
    }

    return successResponse(group);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
