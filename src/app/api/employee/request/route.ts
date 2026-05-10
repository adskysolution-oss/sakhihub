import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MemberRequest from '@/models/MemberRequest';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { notifyEmployeeInvite } from '@/lib/notifications';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'employee') {
      return errorResponse('Unauthorized. Only employees can send requests.', 401);
    }

    await dbConnect();
    const { memberUserId, message } = await req.json();

    if (!memberUserId) {
      return errorResponse('Member User ID is required', 400);
    }

    const member = await WomenMember.findOne({ userId: memberUserId });
    if (!member) {
      return errorResponse('Member profile not found', 404);
    }

    // Check if a request already exists
    const existingRequest = await MemberRequest.findOne({
      memberId: memberUserId,
      employeeId: (session as any).id,
      status: 'pending'
    });

    if (existingRequest) {
      return errorResponse('A pending request already exists for this member', 400);
    }

    const newRequest = await MemberRequest.create({
      memberId: memberUserId,
      employeeId: (session as any).id,
      pincode: member.pincode,
      message,
      requestedBy: 'employee',
      status: 'pending'
    });

    // Update WomenMember connection status
    await WomenMember.findOneAndUpdate(
      { userId: memberUserId },
      { connectionStatus: 'pending_request' }
    );

    // Notify member asynchronously
    notifyEmployeeInvite((session as any).id, memberUserId, message);

    return successResponse(newRequest, 'Connection request sent to member successfully', 201);
  } catch (error: any) {
    console.error('Employee Request Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
