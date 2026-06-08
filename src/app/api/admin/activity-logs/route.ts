import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    
    let query: any = {};
    if (search) {
      const User = (await import('@/models/User')).default;
      const users = await User.find({
        fullName: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { performedBy: { $in: userIds } },
        { targetUser: { $in: userIds } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const logs = await AuditLog.find(query)
      .populate('performedBy', 'fullName role mobile')
      .populate('targetUser', 'fullName role mobile')
      .sort({ timestamp: -1 })
      .limit(200);

    return successResponse(logs);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
