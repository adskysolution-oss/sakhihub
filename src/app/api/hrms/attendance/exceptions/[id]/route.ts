import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import HrmsSettings from '@/models/HrmsSettings';
import AttendanceAudit from '@/models/AttendanceAudit';
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
    const allowedRoles = ['super_admin', 'operations_admin', 'staff'];
    if (!allowedRoles.includes(sessionUser.role)) {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const { id: attendanceId } = await params;
    const body = await req.json();
    const { action, exceptionType, adminRemarks, newCheckInTime, newCheckOutTime, adjustReason } = body;

    await dbConnect();

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return errorResponse('Attendance record not found', 404);
    }

    const oldStatus = attendance.attendanceStatus;
    const oldCheckInTime = attendance.checkInTime;
    const oldCheckOutTime = attendance.checkOutTime;

    // Save originals if not set
    if (!attendance.originalCheckInTime) attendance.originalCheckInTime = oldCheckInTime;
    if (!attendance.originalCheckOutTime) attendance.originalCheckOutTime = oldCheckOutTime;
    if (!attendance.originalStatus) attendance.originalStatus = oldStatus;

    if (action === 'approve') {
      if (exceptionType === 'late') {
        if (attendance.lateReason) {
          attendance.lateReason.reviewStatus = 'Approved';
          attendance.lateReason.reviewedBy = sessionUser.id;
          attendance.lateReason.reviewedAt = new Date();
          attendance.lateReason.adminRemarks = adminRemarks || '';
        }
        attendance.attendanceStatus = 'Present';
        attendance.attendanceScore = 1;
      } else if (exceptionType === 'early') {
        attendance.earlyCheckoutReviewStatus = 'Approved';
        if (attendance.attendanceStatus === 'Present' || attendance.attendanceStatus === 'Late') {
          attendance.attendanceScore = 1;
        }
      }
      await attendance.save();

      // Log action
      const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
      await logActivity('Admin Approved Exception', sessionUser.id, undefined, ipAddress, {
        attendanceId,
        exceptionType,
        adminRemarks
      });

      return successResponse(attendance, 'Exception approved successfully');
    }

    if (action === 'reject') {
      if (exceptionType === 'late') {
        if (attendance.lateReason) {
          attendance.lateReason.reviewStatus = 'Rejected';
          attendance.lateReason.reviewedBy = sessionUser.id;
          attendance.lateReason.reviewedAt = new Date();
          attendance.lateReason.adminRemarks = adminRemarks || '';
        }
      } else if (exceptionType === 'early') {
        attendance.earlyCheckoutReviewStatus = 'Rejected';
      }
      await attendance.save();

      // Log action
      const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
      await logActivity('Admin Rejected Exception', sessionUser.id, undefined, ipAddress, {
        attendanceId,
        exceptionType,
        adminRemarks
      });

      return successResponse(attendance, 'Exception rejected successfully');
    }

    if (action === 'half_day') {
      attendance.attendanceStatus = 'Half Day';
      attendance.attendanceScore = 0.5;

      if (exceptionType === 'late' && attendance.lateReason) {
        attendance.lateReason.reviewStatus = 'Rejected';
        attendance.lateReason.reviewedBy = sessionUser.id;
        attendance.lateReason.reviewedAt = new Date();
        attendance.lateReason.adminRemarks = adminRemarks || 'Applied Half Day Penalty';
      } else if (exceptionType === 'early') {
        attendance.earlyCheckoutReviewStatus = 'Rejected';
      }
      await attendance.save();

      // Audit log entry for override
      await AttendanceAudit.create({
        employeeId: attendance.employeeId,
        attendanceId: attendance._id,
        oldStatus,
        newStatus: 'Half Day',
        oldCheckInTime,
        newCheckInTime: oldCheckInTime,
        oldCheckOutTime,
        newCheckOutTime: oldCheckOutTime,
        reason: adminRemarks || 'Admin applied Half Day penalty',
        modifiedBy: sessionUser.id
      });

      return successResponse(attendance, 'Half Day penalty applied successfully');
    }

    if (action === 'adjust') {
      if (!adjustReason) {
        return errorResponse('Justification reason is required for manual adjustments.', 400);
      }

      let parsedCheckIn = oldCheckInTime;
      let parsedCheckOut = oldCheckOutTime;

      if (newCheckInTime) parsedCheckIn = new Date(newCheckInTime);
      if (newCheckOutTime) parsedCheckOut = new Date(newCheckOutTime);

      // Fetch settings to recalculate status
      let settings = await HrmsSettings.findOne().lean();
      if (!settings) {
        settings = await HrmsSettings.create({
          shiftStartTime: '09:00',
          graceMinutes: 10,
          shiftEndTime: '18:30',
          earlyCheckoutThreshold: '18:00',
          consecutiveLateThreshold: 3
        });
      }

      // Check if adjusted check in is late
      let isLate = false;
      if (parsedCheckIn) {
        const timeString = parsedCheckIn.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        const [currentHour, currentMinute] = timeString.split(':').map(Number);
        const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

        const [startHour, startMinute] = settings.shiftStartTime.split(':').map(Number);
        const startMinutesSinceMidnight = startHour * 60 + startMinute;
        const cutoffMinutes = startMinutesSinceMidnight + settings.graceMinutes;

        isLate = currentMinutesSinceMidnight > cutoffMinutes;
      }

      let recalculatedStatus = oldStatus;
      let recalculatedScore = attendance.attendanceScore;

      if (parsedCheckIn && parsedCheckOut) {
        recalculatedStatus = isLate ? 'Late' : 'Present';
        recalculatedScore = 1;
      } else if (parsedCheckIn) {
        recalculatedStatus = isLate ? 'Late' : 'Checked In';
        recalculatedScore = 1;
      }

      // Calculate working hours
      let workingHours = attendance.workingHours;
      if (parsedCheckIn && parsedCheckOut) {
        workingHours = parseFloat(((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / (1000 * 60 * 60)).toFixed(2));
      }

      attendance.checkInTime = parsedCheckIn;
      attendance.checkOutTime = parsedCheckOut;
      attendance.workingHours = workingHours;
      attendance.attendanceStatus = recalculatedStatus as any;
      attendance.attendanceScore = recalculatedScore;

      // Reset exception status if check-in is corrected to on-time
      if (!isLate && attendance.lateReason) {
        attendance.lateReason.reviewStatus = 'Approved';
        attendance.lateReason.adminRemarks = `Corrected via adjustment: ${adjustReason}`;
      }

      await attendance.save();

      // Create Audit trail
      await AttendanceAudit.create({
        employeeId: attendance.employeeId,
        attendanceId: attendance._id,
        oldStatus,
        newStatus: recalculatedStatus,
        oldCheckInTime,
        newCheckInTime: parsedCheckIn,
        oldCheckOutTime,
        newCheckOutTime: parsedCheckOut,
        reason: adjustReason,
        modifiedBy: sessionUser.id
      });

      return successResponse(attendance, 'Attendance adjusted successfully');
    }

    return errorResponse('Invalid action specified', 400);
  } catch (error: any) {
    console.error('HRMS Exceptions PATCH Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
