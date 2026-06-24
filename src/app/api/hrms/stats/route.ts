import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import DailyFieldReport from '@/models/DailyFieldReport';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { applyRegionalFilter } from '@/utils/authHelpers';

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

    // Query active employees/staff with isHrmsEnabled: true
    let employeeQuery: any = { role: { $in: ['employee', 'staff'] }, isHrmsEnabled: true };

    // Scoping check
    if (sessionUser.role === 'employee') {
      const designation = sessionUser.designation || '';
      if (['District Coordinator', 'District Project Officer'].includes(designation)) {
        employeeQuery.district = sessionUser.district;
      } else if (['Block Coordinator', 'Block Executive'].includes(designation)) {
        employeeQuery.block = sessionUser.block;
      } else {
        employeeQuery._id = sessionUser.id;
      }
    } else if (['operations_admin', 'staff'].includes(sessionUser.role)) {
      await applyRegionalFilter(employeeQuery, session);
    }

    const targetEmployees = await User.find(employeeQuery).lean();
    const employeeIds = targetEmployees.map(e => e._id);

    if (employeeIds.length === 0) {
      return successResponse({
        attendance: { presentToday: 0, checkedInNow: 0, absentToday: 0, checkoutMissing: 0 },
        fieldActivity: { submittedToday: 0, pendingToday: 0 },
        employeeMetrics: { total: 0, active: 0, suspended: 0 },
        leaveMetrics: { pending: 0, approved: 0, rejected: 0 },
        compliance: {
          warning1Count: 0,
          warning2Count: 0,
          penaltyPendingCount: 0,
          exceptionsPendingReviewCount: 0,
          lateTodayCount: 0,
          halfDayTodayCount: 0,
          absentTodayCount: 0,
          penaltyPendingTodayCount: 0
        }
      });
    }

    const todayStr = getTodayStr();

    // 1. Attendance Metrics
    const todayAttendance = await Attendance.find({
      employeeId: { $in: employeeIds },
      date: todayStr
    }).lean();

    const checkedInNowCount = todayAttendance.filter(a => a.attendanceStatus === 'Checked In').length;
    const checkedOutCount = todayAttendance.filter(a => ['Checked Out', 'Present', 'Late', 'Half Day', 'Penalty Pending'].includes(a.attendanceStatus) && a.checkOutTime).length;
    const presentCount = checkedInNowCount + checkedOutCount;
    const absentCount = Math.max(0, employeeIds.length - presentCount);

    const missingCheckoutsCount = await Attendance.countDocuments({
      employeeId: { $in: employeeIds },
      date: { $ne: todayStr },
      attendanceStatus: 'Checked In'
    });

    // 2. Fine-grained daily attendance metrics
    const lateTodayCount = todayAttendance.filter(a => a.attendanceStatus === 'Late').length;
    const halfDayTodayCount = todayAttendance.filter(a => a.attendanceStatus === 'Half Day').length;
    const absentTodayCount = todayAttendance.filter(a => a.attendanceStatus === 'Absent').length;
    const penaltyPendingTodayCount = todayAttendance.filter(a => a.attendanceStatus === 'Penalty Pending').length;

    // 3. Dynamic compliance warnings across all employees
    const lastAttendances = await Attendance.find({
      employeeId: { $in: employeeIds }
    }).sort({ date: -1 }).lean();

    const employeeAttendanceGroup: Record<string, any[]> = {};
    for (const record of lastAttendances) {
      const empIdStr = String(record.employeeId);
      if (!employeeAttendanceGroup[empIdStr]) {
        employeeAttendanceGroup[empIdStr] = [];
      }
      employeeAttendanceGroup[empIdStr].push(record);
    }

    let warning1Count = 0;
    let warning2Count = 0;
    let penaltyPendingCount = 0;

    for (const empId of employeeIds) {
      const empIdStr = String(empId);
      const logs = employeeAttendanceGroup[empIdStr] || [];
      
      let consecutiveLates = 0;
      for (const log of logs) {
        if (log.attendanceStatus === 'Late' || log.attendanceStatus === 'Penalty Pending') {
          consecutiveLates++;
        } else if (log.attendanceStatus === 'Present' || log.attendanceStatus === 'Checked In') {
          break;
        }
      }

      if (consecutiveLates === 1) {
        warning1Count++;
      } else if (consecutiveLates === 2) {
        warning2Count++;
      } else if (consecutiveLates >= 3) {
        penaltyPendingCount++;
      }
    }

    // 4. Exceptions pending review
    const exceptionsPendingReviewCount = await Attendance.countDocuments({
      employeeId: { $in: employeeIds },
      $or: [
        { 'lateReason.reviewStatus': 'Pending' },
        { isMajorEarlyCheckout: true, earlyCheckoutReviewStatus: 'Pending' }
      ]
    });

    // 5. Leave Metrics
    const pendingLeaves = await LeaveRequest.countDocuments({ employeeId: { $in: employeeIds }, status: 'Pending' });
    const approvedLeaves = await LeaveRequest.countDocuments({ employeeId: { $in: employeeIds }, status: 'Approved' });
    const rejectedLeaves = await LeaveRequest.countDocuments({ employeeId: { $in: employeeIds }, status: 'Rejected' });

    // 6. Field Activity Metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const reportsToday = await DailyFieldReport.find({
      employeeId: { $in: employeeIds },
      reportDate: { $gte: startOfToday, $lte: endOfToday }
    }).lean();

    const reportsSubmittedCount = reportsToday.length;

    const checkedInIds = todayAttendance.map(a => String(a.employeeId));
    const reportedIds = reportsToday.map(r => String(r.employeeId));
    const reportsPendingCount = checkedInIds.filter(id => !reportedIds.includes(id)).length;

    // 7. Employee Metrics
    let baseEmployeeQuery: any = { role: { $in: ['employee', 'staff'] } };
    if (sessionUser.role === 'employee') {
      const designation = sessionUser.designation || '';
      if (['District Coordinator', 'District Project Officer'].includes(designation)) {
        baseEmployeeQuery.district = sessionUser.district;
      } else if (['Block Coordinator', 'Block Executive'].includes(designation)) {
        baseEmployeeQuery.block = sessionUser.block;
      } else {
        baseEmployeeQuery._id = sessionUser.id;
      }
    } else if (['operations_admin', 'staff'].includes(sessionUser.role)) {
      await applyRegionalFilter(baseEmployeeQuery, session);
    }

    const totalEmployees = await User.countDocuments(baseEmployeeQuery);
    const activeEmployees = await User.countDocuments({ ...baseEmployeeQuery, status: 'active' });
    const suspendedEmployees = await User.countDocuments({ ...baseEmployeeQuery, status: 'suspended' });

    return successResponse({
      attendance: {
        presentToday: presentCount,
        checkedInNow: checkedInNowCount,
        absentToday: absentCount,
        checkoutMissing: missingCheckoutsCount
      },
      fieldActivity: {
        submittedToday: reportsSubmittedCount,
        pendingToday: reportsPendingCount
      },
      employeeMetrics: {
        total: totalEmployees,
        active: activeEmployees,
        suspended: suspendedEmployees
      },
      leaveMetrics: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves
      },
      compliance: {
        warning1Count,
        warning2Count,
        penaltyPendingCount,
        exceptionsPendingReviewCount,
        lateTodayCount,
        halfDayTodayCount,
        absentTodayCount,
        penaltyPendingTodayCount
      }
    });
  } catch (error: any) {
    console.error('HRMS Stats API GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
