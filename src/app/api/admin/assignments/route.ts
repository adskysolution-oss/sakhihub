import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { userId, assignedScope, assignedStates, assignedDistricts, assignedBlocks, assignedRegions } = await req.json();

    if (!userId) {
      return errorResponse('Missing userId', 400);
    }

    const user = await User.findById(userId);
    const isDC = user && user.role === 'employee' && ['District Coordinator', 'District Project Officer'].includes(user.designation || '');
    if (!user || (!['operations_admin', 'staff'].includes(user.role) && !isDC)) {
      return errorResponse('Operations Admin, Staff, or District Coordinator not found', 404);
    }

    user.assignedScope = assignedScope || 'all';
    user.assignedStates = assignedStates || [];
    user.assignedDistricts = assignedDistricts || [];
    user.assignedBlocks = assignedBlocks || [];
    user.assignedRegions = assignedRegions || [];
    await user.save();

    const { logActivity } = await import('@/utils/authHelpers');
    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    const sessionUser = session as any;
    await logActivity('assignments_updated', sessionUser.id, user._id, ip, {
      assignedScope,
      assignedStates,
      assignedDistricts,
      assignedBlocks,
      assignedRegions
    });

    return successResponse(user, 'Assignments updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
