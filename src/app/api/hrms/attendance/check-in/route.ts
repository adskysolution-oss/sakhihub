import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

// Get today's date in Asia/Kolkata timezone (YYYY-MM-DD)
function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    await dbConnect();

    // Check if HRMS is enabled for employee
    const user = await User.findById(sessionUser.id);
    if (!user || !user.isHrmsEnabled) {
      return successResponse({ hrmsEnabled: false }, 'HRMS is not enabled for this user');
    }

    const todayStr = getTodayStr();
    const attendance = await Attendance.findOne({
      employeeId: sessionUser.id,
      date: todayStr
    }).lean() as any;

    if (attendance && attendance.checkInPhoto?.url) {
      const { signMediaUrl } = await import('@/lib/s3');
      attendance.checkInPhoto.url = await signMediaUrl(attendance.checkInPhoto.url);
    }

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

    return successResponse({ hrmsEnabled: true, attendance, settings });
  } catch (error: any) {
    console.error('Check-in status GET API error:', error);
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

    // Verify HRMS access
    const user = await User.findById(sessionUser.id);
    if (!user || !user.isHrmsEnabled) {
      return errorResponse('HRMS access is not enabled for your account.', 403);
    }

    const body = await req.json();
    const { photoUrl, location, deviceInfo, lateReasonCategory, lateReasonExplanation } = body;

    if (!photoUrl) {
      return errorResponse('Selfie photo is required to check-in.', 400);
    }
    if (!location || !location.latitude || !location.longitude || !location.accuracy) {
      return errorResponse('GPS location coordinates are required.', 400);
    }

    const todayStr = getTodayStr();

    // Prevent multiple check-ins
    const existingRecord = await Attendance.findOne({
      employeeId: sessionUser.id,
      date: todayStr
    });

    if (existingRecord) {
      return errorResponse('You have already checked in for today.', 400);
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

    const [startHour, startMinute] = settings.shiftStartTime.split(':').map(Number);
    const startMinutesSinceMidnight = startHour * 60 + startMinute;
    const cutoffMinutes = startMinutesSinceMidnight + settings.graceMinutes;

    const isLate = currentMinutesSinceMidnight > cutoffMinutes;

    if (isLate) {
      if (!lateReasonCategory) {
        return errorResponse('Late check-in category is required.', 400);
      }
      if (!lateReasonExplanation) {
        return errorResponse('Late check-in explanation is required.', 400);
      }
    }

    let previousLatesCount = 0;
    if (isLate) {
      const previousAttendances = await Attendance.find({
        employeeId: sessionUser.id,
        date: { $lt: todayStr }
      }).sort({ date: -1 }).limit(10).lean();

      for (const att of previousAttendances) {
        const status = att.attendanceStatus;
        if (status === 'Late' || status === 'Penalty Pending') {
          previousLatesCount++;
        } else if (status === 'Present' || status === 'Checked In') {
          break;
        }
      }
    }

    let targetStatus: 'Checked In' | 'Late' | 'Penalty Pending' = 'Checked In';
    let attendanceScore = 1;
    if (isLate) {
      const thresholdLimit = (settings.consecutiveLateThreshold || 3) - 1;
      if (previousLatesCount >= thresholdLimit) {
        targetStatus = 'Penalty Pending';
        attendanceScore = 0;
      } else {
        targetStatus = 'Late';
        attendanceScore = 1;
      }
    }

    const attendanceRecord = await Attendance.create({
      employeeId: sessionUser.id,
      date: todayStr,
      checkInTime: now,
      checkInPhoto: {
        url: photoUrl,
        uploadedAt: now
      },
      checkInLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        address: location.address || '',
        locationTimestamp: location.locationTimestamp ? new Date(location.locationTimestamp) : now
      },
      attendanceStatus: targetStatus,
      deviceInfo: deviceInfo || '',
      attendanceScore,
      originalCheckInTime: now,
      originalStatus: targetStatus,
      lateReason: isLate ? {
        category: lateReasonCategory,
        explanation: lateReasonExplanation,
        reviewStatus: 'Pending'
      } : undefined
    });

    // Write audit log
    const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity('Employee Checked In', sessionUser.id, undefined, ipAddress, {
      attendanceId: attendanceRecord._id,
      latitude: location.latitude,
      longitude: location.longitude
    });

    const attendanceObj = attendanceRecord.toObject();
    if (attendanceObj.checkInPhoto?.url) {
      const { signMediaUrl } = await import('@/lib/s3');
      attendanceObj.checkInPhoto.url = await signMediaUrl(attendanceObj.checkInPhoto.url);
    }

    return successResponse(attendanceObj, 'Check-In successful');
  } catch (error: any) {
    console.error('Check-in POST API error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
