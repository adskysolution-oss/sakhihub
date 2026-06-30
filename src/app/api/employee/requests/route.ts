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

    console.log("[DEBUG] GET /api/employee/requests for employeeId:", (session as any).id);

    const requests = await MemberRequest.find({
      employeeId: (session as any).id
    }).populate('memberId', 'fullName mobile area address');

    console.log("[DEBUG] GET /api/employee/requests returning count:", requests.length);

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
    const employee = await User.findById((session as any).id);

    if (status === 'approved') {
      // Atomic verification: check if member is already assigned to someone else
      const updatedMember = await WomenMember.findOneAndUpdate(
        { userId: updatedRequest.memberId, connectionStatus: { $ne: 'approved' } },
        { 
          connectionStatus: 'approved',
          assignedEmployeeId: (session as any).id,
          vendorCode: employee?.vendorCode,
          subVendorCode: employee?.subVendorCode
        },
        { new: true }
      );

      if (!updatedMember) {
        // Revert request status to pending to avoid inconsistencies
        await MemberRequest.findOneAndUpdate({ _id: id }, { status: 'pending' });
        return errorResponse('Member is already assigned to another agent/employee', 409);
      }

      // Propagate hierarchy and access details to User document
      if (employee) {
        await User.findByIdAndUpdate(updatedRequest.memberId, {
          parentVendorId: (session as any).id,
          parentEmployeeCode: employee.employeeId,
          parentVendorCode: employee.vendorCode,
          parentSubVendorCode: employee.subVendorCode,
          assignmentStatus: 'completed',
          dashboardAccess: true,
          onboardingCompleted: true,
          status: 'active'
        });
      }

      // Trigger standard email notification
      const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
      await NotificationService.trigger(NotificationEvent.PARENT_ASSIGNED, { userId: updatedRequest.memberId });

    } else if (status === 'rejected') {
      await WomenMember.findOneAndUpdate(
        { userId: updatedRequest.memberId },
        { connectionStatus: 'unassigned' }
      );

      // Trigger rejection email notification
      const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
      await NotificationService.trigger(NotificationEvent.CONNECTION_REJECTED, {
        userId: updatedRequest.memberId,
        employeeId: (session as any).id
      });
    }

    return successResponse(updatedRequest, `Request ${status} successfully`);
  } catch (error: any) {
    console.error('Update Request Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
