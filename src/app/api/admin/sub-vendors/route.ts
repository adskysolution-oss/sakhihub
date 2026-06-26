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
    const { verifyPermission, applyRegionalFilter } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('sub_vendors.view');
    if (!authorized) return error;

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

    let baseMatch: any = { role: 'sub_vendor', ...dateQuery };
    await applyRegionalFilter(baseMatch, session);

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
    const counts = parseCountsFromFacet(resultFacet) as any;
    counts.status.unassigned = await User.countDocuments({
      ...baseMatch,
      $or: [{ parentVendorId: null }, { parentVendorId: { $exists: false } }]
    });

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

    const sessionUser = session as any;
    const hasCredentialsView = sessionUser.role === 'super_admin' || 
      (Array.isArray(sessionUser.permissions) && sessionUser.permissions.includes('credentials.view'));
    const hasDocumentsView = sessionUser.role === 'super_admin' || 
      (Array.isArray(sessionUser.permissions) && sessionUser.permissions.includes('documents.view'));

    const sanitizedData = sanitizeUserListForClient(enrichedSubVendors, hasCredentialsView, hasDocumentsView);

    return Response.json({
      success: true,
      data: sanitizedData,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
