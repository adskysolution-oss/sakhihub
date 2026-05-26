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

export async function PATCH(
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

    const group = await Group.findById(id);
    if (!group) return errorResponse('Group not found', 404);

    // Permission check: only super_admin or creator
    if (role !== 'super_admin' && group.createdBy.toString() !== userId) {
      return errorResponse('Forbidden: You can only edit your own groups', 403);
    }

    const body = await req.json();
    const allowedFields = [
      'groupName', 'village', 'panchayatWard', 'block', 'district', 
      'leaderName', 'leaderMobile', 'meetingDate', 'campaignId', 
      'remarks', 'vendorCode', 'subVendorCode', 'createdBy'
    ];

    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'meetingDate' && body[key]) {
          group[key] = new Date(body[key]);
        } else if (key === 'campaignId' && (body[key] === 'temp' || !body[key])) {
          group[key] = undefined;
        } else {
          group[key] = body[key];
        }
      }
    });

    await group.save();
    return successResponse(group, 'Group updated successfully');
  } catch (error: any) {
    console.error('Group PATCH Error:', error);
    return errorResponse(error.message || 'Failed to update group', 500);
  }
}
