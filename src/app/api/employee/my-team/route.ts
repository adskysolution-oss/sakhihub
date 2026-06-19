import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { 
  buildDateRangeQuery, 
  buildStatusQuery, 
  buildPaginationAndCountsFacet, 
  parseCountsFromFacet, 
  resolveActiveStatuses 
} from '@/utils/filterHelpers';
import { sanitizeUserListForClient } from '@/utils/apiSecurity';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'employee') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // Verify logged-in District Coordinator
    const coordinator = await User.findById((session as any).id);
    if (!coordinator) {
      return errorResponse('District Coordinator not found', 404);
    }

    const isDC = ['District Coordinator', 'District Project Officer'].includes(coordinator.designation || '');
    if (!isDC) {
      return errorResponse('Forbidden: Only District Coordinators can view team employees', 403);
    }

    const assignedBlocks = coordinator.assignedBlocks || [];
    if (assignedBlocks.length === 0) {
      return Response.json({
        success: true,
        data: [],
        counts: { status: {}, payment: {} }
      });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');
    const customDate = searchParams.get('customDate');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    const dateQuery = buildDateRangeQuery(dateRange, customDate, startDate, endDate);
    const { activeStatus } = resolveActiveStatuses(status, null);
    const statusFilterQuery = buildStatusQuery(activeStatus);

    // Build case-insensitive regexes for blocks to ensure robust scoping
    const blockRegexes = assignedBlocks.map((b: string) => new RegExp(`^${b.trim()}$`, 'i'));

    // Block scoping base match query
    const baseMatch: any = {
      role: 'employee',
      designation: {
        $in: ['Block Coordinator', 'Field Executive', 'Block Employee']
      },
      $or: [
        { workBlock: { $in: blockRegexes } },
        { block: { $in: blockRegexes } }
      ],
      ...dateQuery
    };

    if (search) {
      baseMatch.$and = [
        {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
            { employeeId: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    // Build facets for aggregation counts and pagination
    const facet = buildPaginationAndCountsFacet(page, limit, statusFilterQuery, {});

    const aggregationResult = await User.aggregate([
      { $match: baseMatch },
      { $facet: facet }
    ]);

    const resultFacet = aggregationResult[0] || { statusCounts: [], paymentCounts: [], data: [] };
    const counts = parseCountsFromFacet(resultFacet);

    const populatedEmployees = await User.populate(resultFacet.data, {
      path: 'parentVendorId',
      select: 'fullName'
    });

    const employees = JSON.parse(JSON.stringify(populatedEmployees));
    const sanitizedData = sanitizeUserListForClient(employees);

    return Response.json({
      success: true,
      data: sanitizedData,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
