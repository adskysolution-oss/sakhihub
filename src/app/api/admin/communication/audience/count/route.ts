import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { 
  getCampaignRecipients, 
  extractRoleFromFilters, 
  translateFiltersToMongoQuery, 
  translateFiltersToMemberMongoQuery 
} from '@/utils/audienceBuilder';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const { filters } = await req.json();

    // Call unified extraction service
    const recipients = await getCampaignRecipients(filters);
    const count = recipients.length;

    // Gather debug information
    const role = extractRoleFromFilters(filters);
    let matchedCollection = 'User';
    let generatedQuery: any = {};
    let rawCount = 0;

    if (role === 'member') {
      matchedCollection = 'WomenMember';
      generatedQuery = await translateFiltersToMemberMongoQuery(filters);
      
      const rawAggregation = await WomenMember.aggregate([
        { $match: { accountStatus: { $ne: 'inactive' } } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDoc"
          }
        },
        {
          $unwind: {
            path: "$userDoc",
            preserveNullAndEmptyArrays: true
          }
        },
        ...(Object.keys(generatedQuery).length > 0 ? [{ $match: generatedQuery }] : []),
        { $count: "count" }
      ]);
      rawCount = rawAggregation[0]?.count || 0;
    } else {
      matchedCollection = 'User';
      generatedQuery = await translateFiltersToMongoQuery(filters);
      // Ensure email is present
      generatedQuery.email = { $exists: true, $ne: '' };
      rawCount = await User.countDocuments(generatedQuery);
    }

    return successResponse({
      count,
      debug: {
        matchedCollection,
        generatedQuery,
        rawCount,
        uniqueRecipients: count
      }
    });
  } catch (error: any) {
    console.error('[AUDIENCE_COUNT_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
