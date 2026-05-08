import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Membership from '@/models/Membership';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const membership = await Membership.findById(id)
      .populate('memberId', 'name mobile village')
      .populate('groupId', 'groupName village')
      .populate('employeeId', 'fullName');

    if (!membership) return errorResponse('Membership record not found', 404);

    // Map to a cleaner object for the receipt
    const data = {
      ...membership.toObject(),
      member: membership.memberId,
      group: membership.groupId,
      employee: membership.employeeId
    };

    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
