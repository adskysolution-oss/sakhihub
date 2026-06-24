import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
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
    const { location, earlyCheckOutReason } = body;

    if (!location || !location.latitude || !location.longitude || !location.accuracy) {
      return errorResponse('GPS location coordinates are required to check-out.', 400);
    }

    const todayStr = getTodayStr();

    // Find today's check-in record
    const attendance = await Attendance.findOne({
      employeeId: sessionUser.id,
      date: todayStr
    });

    if (!attendance) {
      return errorResponse('No active check-in record found for today. You must check-in first.', 400);
    }

    const completedStatuses = ['Checked Out', 'Present', 'Late', 'Half Day', 'Penalty Pending'];
    if (attendance.checkOutTime) {
      return errorResponse('You have already checked out for today.', 400);
    }

    // Fetch active HRMS settings
    const HrmsSettings = (await import('@/models/HrmsSettings')).default;
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

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const [currentHour, currentMinute] = timeString.split(':').map(Number);
    const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

    const [endHour, endMinute] = settings.shiftEndTime.split(':').map(Number);
    const endMinutesSinceMidnight = endHour * 60 + endMinute;

    const [thresholdHour, thresholdMinute] = settings.earlyCheckoutThreshold.split(':').map(Number);
    const thresholdMinutesSinceMidnight = thresholdHour * 60 + thresholdMinute;

    const isEarlyCheckout = currentMinutesSinceMidnight < endMinutesSinceMidnight;
    const isMajorEarlyCheckout = currentMinutesSinceMidnight < thresholdMinutesSinceMidnight;

    if (isEarlyCheckout && !earlyCheckOutReason) {
      return errorResponse('An early check-out reason is required.', 400);
    }

    const checkInTime = attendance.checkInTime || now;
    const workingHours = parseFloat(((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)).toFixed(2));

    attendance.checkOutTime = now;
    attendance.originalCheckOutTime = now;
    attendance.checkOutLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      address: location.address || '',
      locationTimestamp: location.locationTimestamp ? new Date(location.locationTimestamp) : now
    };
    attendance.workingHours = workingHours;

    if (attendance.attendanceStatus === 'Checked In') {
      attendance.attendanceStatus = 'Present';
    }

    if (attendance.attendanceStatus === 'Present' || attendance.attendanceStatus === 'Late') {
      attendance.attendanceScore = 1;
    } else if (attendance.attendanceStatus === 'Penalty Pending') {
      attendance.attendanceScore = 0;
    } else if (attendance.attendanceStatus === 'Half Day') {
      attendance.attendanceScore = 0.5;
    }

    if (isEarlyCheckout) {
      attendance.earlyCheckOutReason = earlyCheckOutReason;
      if (isMajorEarlyCheckout) {
        attendance.isMajorEarlyCheckout = true;
        attendance.earlyCheckoutReviewStatus = 'Pending';
      }
    }

    await attendance.save();

    // Write audit log
    const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity('Employee Checked Out', sessionUser.id, undefined, ipAddress, {
      attendanceId: attendance._id,
      workingHours,
      latitude: location.latitude,
      longitude: location.longitude
    });

    return successResponse(attendance, 'Check-Out successful');
  } catch (error: any) {
    console.error('Check-out POST API error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
