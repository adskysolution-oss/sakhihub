import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    // Gate to Admin only
    if (!['super_admin', 'operations_admin'].includes(sessionUser.role)) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const { id } = await params;
    await dbConnect();

    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return errorResponse('Valid status (Approved or Rejected) is required.', 400);
    }

    if (status === 'Rejected' && !rejectionReason) {
      return errorResponse('Rejection reason is required when rejecting a leave application.', 400);
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) {
      return errorResponse('Leave request not found.', 404);
    }

    if (leave.status !== 'Pending') {
      return errorResponse(`Leave request has already been ${leave.status.toLowerCase()}.`, 400);
    }

    // Update details
    leave.status = status;
    leave.approvedBy = sessionUser.id;
    leave.approvedAt = new Date();
    if (status === 'Rejected') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Write audit log
    const auditAction = status === 'Approved' ? 'Leave Approved' : 'Leave Rejected';
    const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity(auditAction, sessionUser.id, leave.employeeId, ipAddress, {
      leaveId: leave._id,
      rejectionReason: status === 'Rejected' ? rejectionReason : undefined
    });

    return successResponse(leave, `Leave request has been ${status.toLowerCase()} successfully`);
  } catch (error: any) {
    console.error('HRMS Leave Approval PATCH Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
