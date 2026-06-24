import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import HrmsSettings from '@/models/HrmsSettings';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { applyRegionalFilter } from '@/utils/authHelpers';

function minutesToTimeString(minutes: number): string {
  if (isNaN(minutes) || minutes < 0) return '--:--';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  const displayHrs = hrs % 12 || 12;
  return `${String(displayHrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // Expect YYYY-MM
    let employeeId = searchParams.get('employeeId');

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return errorResponse('Invalid or missing month parameter. Format must be YYYY-MM.', 400);
    }

    await dbConnect();

    // Resolve employee scoping
    let targetEmployeeIds: any[] = [];
    if (sessionUser.role === 'employee') {
      targetEmployeeIds = [sessionUser.id];
    } else {
      let employeeQuery: any = { role: { $in: ['employee', 'staff'] }, isHrmsEnabled: true };
      await applyRegionalFilter(employeeQuery, session);

      if (employeeId) {
        employeeQuery._id = employeeId;
      }
      const employees = await User.find(employeeQuery).select('_id').lean();
      targetEmployeeIds = employees.map(e => e._id);
    }

    if (targetEmployeeIds.length === 0) {
      return successResponse({
        stats: { totalPresent: 0, totalLate: 0, totalHalfDay: 0, totalAbsent: 0, totalRecords: 0 },
        averages: { avgCheckIn: '--:--', avgCheckOut: '--:--', totalLateMinutes: 0, avgLateMinutes: 0 },
        complianceScore: 0,
        mostCommonLateReason: 'None',
        mostCommonEarlyCheckoutReason: 'None'
      });
    }

    // Fetch HRMS settings for late minutes calculation
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
    const [startHour, startMinute] = settings.shiftStartTime.split(':').map(Number);
    const shiftStartMinutes = startHour * 60 + startMinute;

    // Query attendance logs in the month for target employees
    const records = await Attendance.find({
      employeeId: { $in: targetEmployeeIds },
      date: { $regex: new RegExp('^' + month) }
    }).lean();

    let totalPresent = 0;
    let totalLate = 0;
    let totalHalfDay = 0;
    let totalAbsent = 0;

    let checkInMinutesSum = 0;
    let checkInCount = 0;
    let checkOutMinutesSum = 0;
    let checkOutCount = 0;

    let totalLateMinutes = 0;
    let lateRecordsCount = 0;

    const lateReasonsMap: Record<string, number> = {};
    const earlyCheckoutReasonsMap: Record<string, number> = {};

    let totalScore = 0;

    for (const record of records) {
      const status = record.attendanceStatus;
      if (status === 'Present') totalPresent++;
      else if (status === 'Late') totalLate++;
      else if (status === 'Half Day') totalHalfDay++;
      else if (status === 'Absent') totalAbsent++;

      totalScore += (record.attendanceScore || 0);

      // Check-in calculation
      if (record.checkInTime) {
        const checkInKolkata = new Date(record.checkInTime);
        const hours = checkInKolkata.getHours();
        const minutes = checkInKolkata.getMinutes();
        const minutesSinceMidnight = hours * 60 + minutes;

        checkInMinutesSum += minutesSinceMidnight;
        checkInCount++;

        if (minutesSinceMidnight > shiftStartMinutes) {
          const diff = minutesSinceMidnight - shiftStartMinutes;
          totalLateMinutes += diff;
          lateRecordsCount++;
        }
      }

      // Check-out calculation
      if (record.checkOutTime) {
        const checkOutKolkata = new Date(record.checkOutTime);
        const hours = checkOutKolkata.getHours();
        const minutes = checkOutKolkata.getMinutes();
        const minutesSinceMidnight = hours * 60 + minutes;

        checkOutMinutesSum += minutesSinceMidnight;
        checkOutCount++;
      }

      // Reasons frequency
      if (record.lateReason?.category) {
        const key = record.lateReason.category;
        lateReasonsMap[key] = (lateReasonsMap[key] || 0) + 1;
      }

      if (record.earlyCheckOutReason) {
        const key = record.earlyCheckOutReason.trim();
        earlyCheckoutReasonsMap[key] = (earlyCheckoutReasonsMap[key] || 0) + 1;
      }
    }

    const avgCheckInMinutes = checkInCount > 0 ? checkInMinutesSum / checkInCount : -1;
    const avgCheckOutMinutes = checkOutCount > 0 ? checkOutMinutesSum / checkOutCount : -1;
    const avgLateMinutes = lateRecordsCount > 0 ? totalLateMinutes / lateRecordsCount : 0;

    let mostCommonLateReason = 'None';
    let maxLateReasonCount = 0;
    for (const [key, count] of Object.entries(lateReasonsMap)) {
      if (count > maxLateReasonCount) {
        maxLateReasonCount = count;
        mostCommonLateReason = key;
      }
    }

    let mostCommonEarlyCheckoutReason = 'None';
    let maxEarlyCount = 0;
    for (const [key, count] of Object.entries(earlyCheckoutReasonsMap)) {
      if (count > maxEarlyCount) {
        maxEarlyCount = count;
        mostCommonEarlyCheckoutReason = key;
      }
    }

    const totalRecords = records.length;
    const complianceScore = totalRecords > 0 ? parseFloat(((totalScore / totalRecords) * 100).toFixed(2)) : 0;

    return successResponse({
      stats: {
        totalPresent,
        totalLate,
        totalHalfDay,
        totalAbsent,
        totalRecords
      },
      averages: {
        avgCheckIn: minutesToTimeString(avgCheckInMinutes),
        avgCheckOut: minutesToTimeString(avgCheckOutMinutes),
        totalLateMinutes,
        avgLateMinutes: parseFloat(avgLateMinutes.toFixed(1))
      },
      complianceScore,
      mostCommonLateReason,
      mostCommonEarlyCheckoutReason
    });
  } catch (error: any) {
    console.error('HRMS Compliance Report GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
