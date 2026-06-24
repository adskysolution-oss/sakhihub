import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    let query: any = { role: { $in: ['employee', 'staff'] } };

    // Scoping boundaries
    if (sessionUser.role === 'employee') {
      const designation = sessionUser.designation || '';
      if (['District Coordinator', 'District Project Officer'].includes(designation)) {
        query.district = sessionUser.district;
      } else if (['Block Coordinator', 'Block Executive'].includes(designation)) {
        query.block = sessionUser.block;
      } else {
        // Standard employees can only view their own records
        query._id = sessionUser.id;
      }
    } else if (['operations_admin', 'staff'].includes(sessionUser.role)) {
      await applyRegionalFilter(query, session);
    }

    // Status filtering
    if (status !== 'all') {
      query.employmentStatus = status;
    }

    // Search query
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await User.find(query)
      .select('fullName mobile email role designation employeeId status state district block area joiningDate department reportingManager employeeType employmentStatus assignedVillages isHrmsEnabled createdAt')
      .populate('reportingManager', 'fullName role email designation')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(employees);
  } catch (error: any) {
    console.error('HRMS Employees API GET Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
