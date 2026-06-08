import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { fullName, email, mobile, password, designation, status, action } = body;

    const user = await User.findById(id);
    if (!user || user.role !== 'operations_admin') {
      return errorResponse('Operations Admin not found', 404);
    }

    const { logActivity } = await import('@/utils/authHelpers');
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // 1. Password Reset
    if (action === 'reset_password') {
      if (!password) {
        return errorResponse('New password is required', 400);
      }
      user.password = await hashPassword(password);
      await user.save();
      await logActivity('operations_admin_password_reset', session.id, user._id, ip);
      return successResponse(null, 'Password reset successfully');
    }

    // 2. Status Toggle (suspend/activate)
    if (action === 'toggle_status') {
      if (!status || !['active', 'suspended'].includes(status)) {
        return errorResponse('Invalid status value', 400);
      }
      user.status = status;
      // If suspended, block dashboard access
      user.dashboardAccess = status === 'active';
      await user.save();
      await logActivity(`operations_admin_${status}`, session.id, user._id, ip);
      return successResponse(user, `Operations admin status updated to ${status}`);
    }

    // 3. Regular Update
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (designation) user.designation = designation;

    await user.save();
    await logActivity('operations_admin_updated', session.id, user._id, ip, {
      fullName,
      email,
      mobile,
      designation
    });

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(userObj, 'Operations admin details updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
