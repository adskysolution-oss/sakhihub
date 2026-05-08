import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DailyReport from '@/models/DailyReport';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    
    const report = await DailyReport.create({
      ...body,
      employeeId: (session as any).id,
    });

    return successResponse(report, 'Daily report submitted successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const role = (session as any).role;
    const userId = (session as any).id;

    let query: any = {};
    if (role === 'employee') query.employeeId = userId;

    const reports = await DailyReport.find(query)
      .sort({ date: -1 })
      .populate('employeeId', 'fullName employeeId');

    return successResponse(reports);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
