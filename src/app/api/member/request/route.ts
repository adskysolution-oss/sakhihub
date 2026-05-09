import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MemberRequest from '@/models/MemberRequest';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized. Only members can send requests.', 401);
    }

    await dbConnect();
    const { employeeId, pincode, message } = await req.json();

    if (!employeeId || !pincode) {
      return errorResponse('Employee ID and Pincode are required', 400);
    }

    // Check if a request already exists
    const existingRequest = await MemberRequest.findOne({
      memberId: (session as any).id,
      employeeId,
      status: 'pending'
    });

    if (existingRequest) {
      return errorResponse('A pending request already exists for this employee', 400);
    }

    const newRequest = await MemberRequest.create({
      memberId: (session as any).id,
      employeeId,
      pincode,
      message,
      status: 'pending'
    });

    // Update WomenMember status
    const WomenMember = (await import('@/models/WomenMember')).default;
    await WomenMember.findOneAndUpdate(
      { userId: (session as any).id },
      { connectionStatus: 'pending_request' }
    );

    return successResponse(newRequest, 'Connection request sent successfully', 201);
  } catch (error: any) {
    console.error('Member Request Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
