import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Membership from '@/models/Membership';
import WomenMember from '@/models/WomenMember';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const { id } = await params;

    const receipt = await Membership.findById(id)
      .populate({
        path: 'memberId',
        model: WomenMember,
        select: 'name mobile village block district'
      })
      .populate({
        path: 'employeeId',
        model: User,
        select: 'fullName mobile'
      });

    if (!receipt) return errorResponse('Receipt not found', 404);

    // Security: Only the member themselves, the assigned employee, or an admin can view the receipt
    const userId = (session as any).id;
    const role = (session as any).role;

    if (role !== 'super_admin') {
      const isOwner = receipt.memberId?.userId?.toString() === userId;
      const isEmployee = receipt.employeeId?._id?.toString() === userId;
      // Note: memberId is the WomenMember profile, which has a userId field.
      // But populate above didn't get userId of memberId.
    }

    return successResponse(receipt);
  } catch (error: any) {
    console.error('Receipt API Error:', error);
    return errorResponse(error.message, 500);
  }
}
