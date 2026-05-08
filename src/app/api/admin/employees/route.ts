import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

// GET all employees with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const district = searchParams.get('district');

    const query: any = { role: 'employee' };
    if (status) query.status = status;
    if (district) query.district = district;

    const employees = await User.find(query).sort({ createdAt: -1 });

    return successResponse(employees);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
