import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { applyRegionalFilter } from '@/utils/authHelpers';

export async function GET(req: NextRequest) {
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

    await dbConnect();

    // Set up employee scoping query first
    let employeeQuery: any = { role: { $in: ['employee', 'staff'] }, isHrmsEnabled: true };
    await applyRegionalFilter(employeeQuery, session);

    const employees = await User.find(employeeQuery).select('_id').lean();
    const employeeIds = employees.map(e => e._id);

    // Fetch exceptions: either pending lateReason review OR pending early checkout review for target employees
    const exceptions = await Attendance.find({
      employeeId: { $in: employeeIds },
      $or: [
        { 'lateReason.reviewStatus': 'Pending' },
        { isMajorEarlyCheckout: true, earlyCheckoutReviewStatus: 'Pending' }
      ]
    })
      .populate('employeeId', 'fullName email employeeId role mobile designation department')
      .sort({ date: -1 })
      .lean();

    return successResponse(exceptions);
  } catch (error: any) {
    console.error('HRMS Exceptions GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
