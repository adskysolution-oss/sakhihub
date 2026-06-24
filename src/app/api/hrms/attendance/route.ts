import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { getRegionalUserIds } from '@/utils/authHelpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    let matchQuery: any = {};

    // Scoping check
    if (sessionUser.role === 'employee') {
      const designation = sessionUser.designation || '';
      if (['District Coordinator', 'District Project Officer'].includes(designation)) {
        const targetUserIds = await User.find({ district: sessionUser.district }, '_id').lean();
        matchQuery.employeeId = { $in: targetUserIds.map(u => u._id) };
      } else if (['Block Coordinator', 'Block Executive'].includes(designation)) {
        const targetUserIds = await User.find({ block: sessionUser.block }, '_id').lean();
        matchQuery.employeeId = { $in: targetUserIds.map(u => u._id) };
      } else {
        matchQuery.employeeId = sessionUser.id;
      }
    } else if (['operations_admin', 'staff'].includes(sessionUser.role)) {
      const scopedUserIds = await getRegionalUserIds(session);
      if (scopedUserIds) {
        matchQuery.employeeId = { $in: scopedUserIds };
      }
    }

    // Apply filters
    if (employeeId) {
      // Ensure current user is authorized to view this specific employee
      if (matchQuery.employeeId) {
        const allowedIds = Array.isArray(matchQuery.employeeId.$in) 
          ? matchQuery.employeeId.$in.map(String)
          : [String(matchQuery.employeeId)];
        if (!allowedIds.includes(String(employeeId))) {
          return errorResponse('Forbidden: Target employee out of scope', 403);
        }
      }
      matchQuery.employeeId = employeeId;
    }

    if (date) {
      matchQuery.date = date;
    }

    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // Fetch records
    const logs = await Attendance.find(matchQuery)
      .populate('employeeId', 'fullName mobile email role designation state district block')
      .sort({ createdAt: -1 })
      .lean() as any[];

    const { signMediaUrl } = await import('@/lib/s3');

    // Process logs to label 'Checkout Missing' dynamically and sign S3 URLs
    const enrichedLogs = await Promise.all(logs.map(async (log) => {
      let resolvedStatus = log.attendanceStatus;
      if (resolvedStatus === 'Checked In' && log.date !== todayStr) {
        resolvedStatus = 'Checkout Missing';
      }
      
      let signedPhotoUrl = log.checkInPhoto?.url || '';
      if (signedPhotoUrl) {
        signedPhotoUrl = await signMediaUrl(signedPhotoUrl);
      }

      return {
        ...log,
        attendanceStatus: resolvedStatus,
        checkInPhoto: log.checkInPhoto ? {
          ...log.checkInPhoto,
          url: signedPhotoUrl
        } : undefined
      };
    }));

    // Filter by status if requested
    const filteredLogs = status && status !== 'all'
      ? enrichedLogs.filter(log => log.attendanceStatus === status)
      : enrichedLogs;

    return successResponse(filteredLogs);
  } catch (error: any) {
    console.error('HRMS Attendance Log GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
