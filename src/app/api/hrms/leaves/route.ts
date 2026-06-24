import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    let matchQuery: any = {};

    // Gating scopes
    if (sessionUser.role === 'employee') {
      matchQuery.employeeId = sessionUser.id;
    } else if (!['super_admin', 'operations_admin'].includes(sessionUser.role)) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    } else {
      // Admin filters
      if (employeeId) {
        matchQuery.employeeId = employeeId;
      }
    }

    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    const leaves = await LeaveRequest.find(matchQuery)
      .populate('employeeId', 'fullName mobile email role designation state district block')
      .populate('approvedBy', 'fullName role')
      .sort({ createdAt: -1 })
      .lean() as any[];

    // Pre-sign leave request attachments
    const { signMediaUrl } = await import('@/lib/s3');
    const enrichedLeaves = await Promise.all(leaves.map(async (leave) => {
      let signedAttachment = leave.attachment || '';
      if (signedAttachment) {
        signedAttachment = await signMediaUrl(signedAttachment);
      }
      return {
        ...leave,
        attachment: signedAttachment
      };
    }));

    return successResponse(enrichedLeaves);
  } catch (error: any) {
    console.error('HRMS Leaves GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    await dbConnect();

    // Verify user is active and has HRMS enabled
    const user = await User.findById(sessionUser.id);
    if (!user || !user.isHrmsEnabled) {
      return errorResponse('HRMS access is not enabled for your account.', 403);
    }

    const body = await req.json();
    const { leaveType, fromDate, toDate, reason, attachment } = body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return errorResponse('Missing required fields: leaveType, fromDate, toDate, and reason are mandatory.', 400);
    }

    const newLeave = await LeaveRequest.create({
      employeeId: sessionUser.id,
      leaveType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      attachment: attachment || '',
      status: 'Pending'
    });

    // Write audit log
    const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity('Leave Applied', sessionUser.id, undefined, ipAddress, {
      leaveId: newLeave._id,
      leaveType,
      fromDate,
      toDate
    });

    return successResponse(newLeave, 'Leave application submitted successfully');
  } catch (error: any) {
    console.error('HRMS Leave Application POST Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
