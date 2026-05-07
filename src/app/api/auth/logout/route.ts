import { removeAuthCookie } from '@/lib/auth';
import { successResponse } from '@/utils/response';

export async function POST() {
  await removeAuthCookie();
  return successResponse(null, 'Logged out successfully');
}
