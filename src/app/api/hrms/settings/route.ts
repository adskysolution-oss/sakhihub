import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import HrmsSettings from '@/models/HrmsSettings';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();

    // Find settings or return default and initialize
    let settings = await HrmsSettings.findOne().lean();
    if (!settings) {
      // Create defaults
      settings = await HrmsSettings.create({
        shiftStartTime: '09:00',
        graceMinutes: 10,
        shiftEndTime: '18:30',
        earlyCheckoutThreshold: '18:00',
        consecutiveLateThreshold: 3
      });
    }

    return successResponse(settings);
  } catch (error: any) {
    console.error('HRMS Settings GET Error:', error);
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
    const allowedRoles = ['super_admin', 'operations_admin', 'staff'];
    if (!allowedRoles.includes(sessionUser.role)) {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const body = await req.json();
    const { shiftStartTime, graceMinutes, shiftEndTime, earlyCheckoutThreshold, consecutiveLateThreshold } = body;

    await dbConnect();

    const updatedSettings = await HrmsSettings.findOneAndUpdate(
      {},
      {
        shiftStartTime,
        graceMinutes: Number(graceMinutes),
        shiftEndTime,
        earlyCheckoutThreshold,
        consecutiveLateThreshold: Number(consecutiveLateThreshold),
        updatedBy: sessionUser.id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(updatedSettings);
  } catch (error: any) {
    console.error('HRMS Settings POST Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
