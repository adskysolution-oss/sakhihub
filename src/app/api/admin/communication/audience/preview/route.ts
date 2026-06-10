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
    
    // Only fetch users with valid emails
    query.email = { $exists: true, $ne: '' };

    // Limit to 10 for audience validation preview
    const previewUsers = await User.find(query)
      .select('fullName email role state district designation')
      .limit(10)
      .lean();

    return successResponse({ preview: previewUsers });
  } catch (error: any) {
    console.error('[AUDIENCE_PREVIEW_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
