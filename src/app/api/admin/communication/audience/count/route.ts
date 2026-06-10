import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { translateFiltersToMongoQuery } from '@/utils/audienceBuilder';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const { filters } = await req.json();

    const query = await translateFiltersToMongoQuery(filters);
    
    // Only count users with valid emails
    query.email = { $exists: true, $ne: '' };

    const count = await User.countDocuments(query);

    return successResponse({ count });
  } catch (error: any) {
    console.error('[AUDIENCE_COUNT_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
