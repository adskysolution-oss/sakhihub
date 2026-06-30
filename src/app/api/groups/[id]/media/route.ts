import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MeetingMedia from '@/models/MeetingMedia';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const role = (session as any).role;
    const userId = (session as any).id || (session as any).userId;

    await dbConnect();

    const group = await Group.findById(id);
    if (!group) return errorResponse('Group not found', 404);

    // Permission checks
    if (role === 'employee' && group.createdBy.toString() !== userId) {
      const User = (await import('@/models/User')).default;
      const userProfile = await User.findById(userId);
      const creatorUser = await User.findById(group.createdBy);
      const { isReportingEmployee } = await import('@/utils/hierarchy');
      const isAuthorized = creatorUser && userProfile && await isReportingEmployee(userProfile, creatorUser);
      if (!isAuthorized) {
        return errorResponse('Forbidden', 403);
      }
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'photo' or 'video' (optional)

    const query: any = { groupId: id };
    if (type) {
      query.type = type;
    }

    const media = await MeetingMedia.find(query).sort({ createdAt: -1 });

    const { signMediaUrl } = await import('@/lib/s3');
    const signedMedia = await Promise.all(media.map(async (item) => {
      const obj = item.toObject();
      obj.url = await signMediaUrl(obj.url);
      if (obj.thumbnailUrl) {
        obj.thumbnailUrl = await signMediaUrl(obj.thumbnailUrl);
      }
      return obj;
    }));

    return successResponse(signedMedia);
  } catch (error: any) {
    console.error('Group media fetch GET error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
