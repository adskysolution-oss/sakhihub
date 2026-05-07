import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    await dbConnect();
    const user = await User.findById((session as any).id).select('-password');
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return errorResponse('Internal Server Error', 500);
  }
}
