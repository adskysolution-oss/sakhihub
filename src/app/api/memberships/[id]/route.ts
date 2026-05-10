import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Membership from '@/models/Membership';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/utils/response';
import { getAuthSession } from '@/lib/auth';
import { notifyMembershipPayment } from '@/lib/notifications';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const membership = await Membership.findById(id)
      .populate('memberId', 'name mobile village')
      .populate('groupId', 'groupName village')
      .populate('employeeId', 'fullName');

    if (!membership) return errorResponse('Membership record not found', 404);

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Admin access required.', 401);
    }

    await dbConnect();
    const { status } = await req.json();

    const membership = await Membership.findByIdAndUpdate(
      id,
      {
        paymentStatus: status,
        verifiedBy: (session as any).id,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!membership) return errorResponse('Membership not found', 404);

    // If payment is failed/rejected, we might want to update the member record back to unpaid
    if (status === 'Failed' || status === 'Pending') {
      await WomenMember.findByIdAndUpdate(membership.memberId, { membershipStatus: 'unpaid' });
    } else if (status === 'Paid') {
      await WomenMember.findByIdAndUpdate(membership.memberId, { membershipStatus: 'paid' });
      // Notify member
      notifyMembershipPayment(membership._id);
    }

    return successResponse(membership, `Membership marked as ${status}`);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
