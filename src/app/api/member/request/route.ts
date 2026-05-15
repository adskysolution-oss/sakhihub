import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MemberRequest from '@/models/MemberRequest';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { notifyMemberRequest } from '@/lib/notifications';

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
      requestedBy: 'member',
      status: 'pending'
    });

    // Update WomenMember status
    const WomenMember = (await import('@/models/WomenMember')).default;
    await WomenMember.findOneAndUpdate(
      { userId: (session as any).id },
      { connectionStatus: 'pending_request' }
    );

    // Notify employee asynchronously
    notifyMemberRequest(employeeId, (session as any).id);

    return successResponse(newRequest, 'Connection request sent successfully', 201);
  } catch (error: any) {
    console.error('Member Request Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'member') {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const { id, status } = await req.json();

    if (!id || !['approved', 'rejected'].includes(status)) {
      return errorResponse('Valid Request ID and status (approved/rejected) are required', 400);
    }

    const updatedRequest = await MemberRequest.findOneAndUpdate(
      { _id: id, memberId: (session as any).id },
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return errorResponse('Request not found or unauthorized', 404);
    }

    // Sync with WomenMember profile
    const WomenMember = (await import('@/models/WomenMember')).default;
    if (status === 'approved') {
      const User = (await import('@/models/User')).default;
      const employee = await User.findById(updatedRequest.employeeId);
      
      await WomenMember.findOneAndUpdate(
        { userId: (session as any).id },
        { 
          connectionStatus: 'approved',
          assignedEmployeeId: updatedRequest.employeeId,
          vendorCode: employee?.vendorCode,
          subVendorCode: employee?.subVendorCode
        }
      );

      // Update User for dashboard access
      await User.findByIdAndUpdate((session as any).id, {
        parentVendorId: updatedRequest.employeeId,
        parentEmployeeCode: employee?.employeeId,
        parentVendorCode: employee?.vendorCode,
        parentSubVendorCode: employee?.subVendorCode,
        assignmentStatus: 'completed',
        dashboardAccess: true,
        onboardingCompleted: true,
        status: 'active'
      });
    } else if (status === 'rejected') {
      await WomenMember.findOneAndUpdate(
        { userId: (session as any).id },
        { connectionStatus: 'unassigned' } // Member rejected, back to unassigned
      );
    }

    return successResponse(updatedRequest, `Request ${status} successfully`);
  } catch (error: any) {
    console.error('Update Request Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
