import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MemberRequest from '@/models/MemberRequest';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

// Get all requests for the current employee
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'employee') {
      return errorResponse('Unauthorized. Only employees can view requests.', 401);
    }

    await dbConnect();
    const requests = await MemberRequest.find({
      employeeId: (session as any).id
    }).populate('memberId', 'fullName mobile area address');

    return successResponse(requests, 'Requests fetched successfully');
  } catch (error: any) {
    console.error('Fetch Requests Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

// Update request status (approve/reject)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'employee') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const { id, status } = await req.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return errorResponse('Valid Request ID and status (approved/rejected) are required', 400);
    }

    const updatedRequest = await MemberRequest.findOneAndUpdate(
      { _id: id, employeeId: (session as any).id },
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return errorResponse('Request not found or unauthorized', 404);
    }

    // Sync with WomenMember profile
    const WomenMember = (await import('@/models/WomenMember')).default;
    if (status === 'approved') {
      await WomenMember.findOneAndUpdate(
        { userId: updatedRequest.memberId },
        { 
          connectionStatus: 'approved',
          assignedEmployeeId: (session as any).id
        }
      );
    } else if (status === 'rejected') {
      await WomenMember.findOneAndUpdate(
        { userId: updatedRequest.memberId },
        { connectionStatus: 'rejected' }
      );
    }

    return successResponse(updatedRequest, `Request ${status} successfully`);
  } catch (error: any) {
    console.error('Update Request Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
