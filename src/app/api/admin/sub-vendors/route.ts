import { NextRequest } from 'next/server';
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
    if (!session || (session as any).role !== 'super_admin') {
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
    const agreementFilter = searchParams.get('agreement');

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    const dateQuery = buildDateRangeQuery(dateRange, customDate, startDate, endDate);
    const { activeStatus, activePaymentStatus } = resolveActiveStatuses(status, paymentStatus);
    const statusFilterQuery = buildStatusQuery(activeStatus);
    const paymentFilterQuery = buildPaymentQuery(activePaymentStatus);

    const baseMatch: any = { role: 'sub_vendor', ...dateQuery };

    if (agreementFilter === 'generated' || agreementFilter === 'not_generated') {
      const VendorAgreement = (await import('@/models/VendorAgreement')).default;
      const generatedIds = await VendorAgreement.find({}, 'vendorId').lean();
      const subVendorIdsWithAgr = generatedIds.map((va: any) => va.vendorId);
      
      if (agreementFilter === 'generated') {
        baseMatch._id = { $in: subVendorIdsWithAgr };
      } else {
        baseMatch._id = { $nin: subVendorIdsWithAgr };
      }
    }

    if (search) {
      const parentVendors = await User.find({
        role: 'vendor',
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { vendorCode: { $regex: search, $options: 'i' } }
        ]
      }, '_id').lean();
      const parentVendorIds = parentVendors.map(v => v._id);

      baseMatch.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { subVendorCode: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { parentVendorId: { $in: parentVendorIds } }
      ];
    }

    const facet = buildPaginationAndCountsFacet(page, limit, statusFilterQuery, paymentFilterQuery);

    const aggregationResult = await User.aggregate([
      { $match: baseMatch },
      { $facet: facet }
    ]);

    const resultFacet = aggregationResult[0] || { statusCounts: [], paymentCounts: [], data: [] };
    const counts = parseCountsFromFacet(resultFacet);

    // Populate parentVendorId on sub-vendors data
    const populatedData = await User.populate(resultFacet.data, {
      path: 'parentVendorId',
      select: 'fullName vendorCode'
    });

    const subVendors = JSON.parse(JSON.stringify(populatedData));
    const VendorAgreementModel = (await import('@/models/VendorAgreement')).default;
    const subVendorIds = subVendors.map((sv: any) => sv._id);
    const agreements = await VendorAgreementModel.find({ vendorId: { $in: subVendorIds } }).lean();
    const agreementMap = agreements.reduce((acc: any, val: any) => {
      acc[val.vendorId.toString()] = val;
      return acc;
    }, {});
    
    const enrichedSubVendors = subVendors.map((sv: any) => ({
      ...sv,
      vendorAgreementDetails: agreementMap[sv._id.toString()] || null
    }));

    const sanitizedData = sanitizeUserListForClient(enrichedSubVendors, true);

    return Response.json({
      success: true,
      data: sanitizedData,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
