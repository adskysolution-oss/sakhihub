import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { status, employeeId, designation, block, area } = await req.json();
    await dbConnect();

    const updateData: any = { status };
    if (employeeId) updateData.employeeId = employeeId;
    if (designation) updateData.designation = designation;
    if (block) updateData.block = block;
    if (area) updateData.area = area;
    if (status === 'active' && !employeeId) {
       // Generate a simple employee ID if not provided
       const count = await User.countDocuments({ role: 'employee' });
       updateData.employeeId = `SKH-${new Date().getFullYear()}-${1000 + count}`;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

    if (!user) {
      return errorResponse('Employee not found', 404);
    }

    return successResponse(user, `Employee status updated to ${status}`);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
