import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { 
  buildDateRangeQuery, 
  buildStatusQuery, 
  buildPaymentQuery, 
  buildPaginationAndCountsFacet, 
  parseCountsFromFacet, 
  resolveActiveStatuses 
} from '@/utils/filterHelpers';
import { sanitizeUserListForClient } from '@/utils/apiSecurity';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange');
    const customDate = searchParams.get('customDate');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    const dateQuery = buildDateRangeQuery(dateRange, customDate, startDate, endDate);
    const { activeStatus, activePaymentStatus } = resolveActiveStatuses(status, paymentStatus);
    const statusFilterQuery = buildStatusQuery(activeStatus);
    const paymentFilterQuery = buildPaymentQuery(activePaymentStatus);

    const baseMatch: any = { 
      role: 'sub_vendor', 
      parentVendorId: new mongoose.Types.ObjectId((session as any).id),
      ...dateQuery 
    };

    if (search) {
      baseMatch.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { subVendorCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const facet = buildPaginationAndCountsFacet(page, limit, statusFilterQuery, paymentFilterQuery);

    const aggregationResult = await User.aggregate([
      { $match: baseMatch },
      { $facet: facet }
    ]);

    const resultFacet = aggregationResult[0] || { statusCounts: [], paymentCounts: [], data: [] };
    const counts = parseCountsFromFacet(resultFacet);

    const populatedData = await User.populate(resultFacet.data, {
      path: 'parentVendorId',
      select: 'fullName vendorCode'
    });

    const subVendors = JSON.parse(JSON.stringify(populatedData));
    const sanitizedData = sanitizeUserListForClient(subVendors);

    return Response.json({
      success: true,
      data: sanitizedData,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
