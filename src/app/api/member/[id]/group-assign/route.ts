import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || !['super_admin', 'employee'].includes((session as any).role)) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const { groupId } = await req.json();

    if (!groupId) {
      return errorResponse('Group ID is required', 400);
    }

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse('Group not found', 404);
    }

    const member = await WomenMember.findById(id);
    if (!member) {
      return errorResponse('Member not found', 404);
    }

    // Permission check for employees
    if ((session as any).role === 'employee') {
       // Only allowed if member is assigned to this employee
       if (member.assignedEmployeeId?.toString() !== (session as any).id) {
         return errorResponse('You are not authorized to assign this member to a group', 403);
       }
    }

    const updatedMember = await WomenMember.findByIdAndUpdate(
      id,
      { 
        groupId,
        village: group.village, // Sync village from group
        block: group.block,
        district: group.district
      },
      { new: true }
    );

    return successResponse(updatedMember, 'Member assigned to group successfully');
  } catch (error: any) {
    console.error('Group Assign Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
