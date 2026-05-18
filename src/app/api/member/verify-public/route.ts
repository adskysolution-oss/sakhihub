import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Membership from '@/models/Membership';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Verification ID is required', 400);
    }

    // Search by membershipId OR receiptNumber
    const membership = await Membership.findOne({
      $or: [
        { membershipId: id.toUpperCase() },
        { receiptNumber: id.toUpperCase() },
        { membershipId: id }, // case sensitive fallback
        { receiptNumber: id }
      ],
      paymentStatus: 'Paid'
    })
    .populate('memberId', 'name mobile village')
    .populate('groupId', 'groupName village district block');

    if (!membership) {
      return errorResponse('Invalid ID or Record not found.', 404);
    }

    // Transform data for public view (only essential info)
    const result = {
      membershipId: membership.membershipId,
      receiptNumber: membership.receiptNumber,
      paymentDate: membership.paymentDate,
      member: {
        name: (membership.memberId as any).name,
        village: (membership.memberId as any).village
      },
      groupId: {
        groupName: (membership.groupId as any)?.groupName,
        village: (membership.groupId as any)?.village
      }
    };

    return successResponse(result, 'Membership verified successfully');
  } catch (error: any) {
    console.error('Public Verification Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
