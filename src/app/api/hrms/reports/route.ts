import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyFieldReport from '@/models/DailyFieldReport';
import Attendance from '@/models/Attendance';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity, getRegionalUserIds } from '@/utils/authHelpers';

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

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const district = searchParams.get('district');
    const block = searchParams.get('block');
    const date = searchParams.get('date');

    let matchQuery: any = {};

    // Scope gating
    if (sessionUser.role === 'employee') {
      const designation = sessionUser.designation || '';
      if (['District Coordinator', 'District Project Officer'].includes(designation)) {
        matchQuery.district = sessionUser.district;
      } else if (['Block Coordinator', 'Block Executive'].includes(designation)) {
        matchQuery.block = sessionUser.block;
      } else {
        matchQuery.employeeId = sessionUser.id;
      }
    } else if (['operations_admin', 'staff'].includes(sessionUser.role)) {
      const scopedUserIds = await getRegionalUserIds(session);
      if (scopedUserIds) {
        matchQuery.employeeId = { $in: scopedUserIds };
      }
    }

    // Apply queries
    if (employeeId) {
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

    if (district && district !== 'all') matchQuery.district = district;
    if (block && block !== 'all') matchQuery.block = block;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      matchQuery.reportDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const reports = await DailyFieldReport.find(matchQuery)
      .populate('employeeId', 'fullName mobile email role designation state district block')
      .sort({ reportDate: -1 })
      .lean() as any[];

    // Pre-sign all report S3 URLs
    const { signMediaUrl } = await import('@/lib/s3');
    const enrichedReports = await Promise.all(reports.map(async (report) => {
      let signedPhotos = [];
      if (Array.isArray(report.photos) && report.photos.length > 0) {
        signedPhotos = await Promise.all(report.photos.map((url: string) => signMediaUrl(url)));
      }
      return {
        ...report,
        photos: signedPhotos
      };
    }));

    return successResponse(enrichedReports);
  } catch (error: any) {
    console.error('HRMS Daily Reports GET Error:', error);
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

    // Fetch user details for auto-scoping location fields
    const user = await User.findById(sessionUser.id);
    if (!user || !user.isHrmsEnabled) {
      return errorResponse('HRMS access is not enabled for your account.', 403);
    }

    const todayStr = getTodayStr();

    // Attendance enforcement rule: Check if Checked-In today
    const attendance = await Attendance.findOne({
      employeeId: sessionUser.id,
      date: todayStr
    });

    if (!attendance) {
      return errorResponse('You must check-in first before submitting your daily report.', 400);
    }

    const body = await req.json();
    const {
      village,
      meetingCount = 0,
      groupsFormed = 0,
      membersAdded = 0,
      photos = [],
      remarks = ''
    } = body;

    if (!village) {
      return errorResponse('Village name is required.', 400);
    }

    const newReport = await DailyFieldReport.create({
      employeeId: sessionUser.id,
      reportDate: new Date(),
      state: user.state || '',
      district: user.district || '',
      block: user.block || '',
      village,
      meetingCount,
      groupsFormed,
      membersAdded,
      photos,
      remarks,
      submittedAt: new Date()
    });

    // Write audit log
    const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity('Daily Field Report Submitted', sessionUser.id, undefined, ipAddress, {
      reportId: newReport._id,
      village,
      groupsFormed,
      membersAdded
    });

    return successResponse(newReport, 'Daily field report submitted successfully');
  } catch (error: any) {
    console.error('HRMS Field Report POST Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
