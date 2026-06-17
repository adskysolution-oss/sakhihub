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
import { employeeStatsService } from '@/services/dashboardStatsService';

export async function GET(req: NextRequest) {
  try {
    const { verifyPermission, applyRegionalFilter } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('employees.view');
    if (!authorized) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const district = searchParams.get('district');
    const search = searchParams.get('search');
    const vendorCode = searchParams.get('vendorCode');
    const subVendorCode = searchParams.get('subVendorCode');
    const dateRange = searchParams.get('dateRange');
    const customDate = searchParams.get('customDate');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');
    const offerLetterFilter = searchParams.get('offerLetter');

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    const dateQuery = buildDateRangeQuery(dateRange, customDate, startDate, endDate);
    const { activeStatus, activePaymentStatus } = resolveActiveStatuses(status, paymentStatus);
    const statusFilterQuery = buildStatusQuery(activeStatus);
    const paymentFilterQuery = buildPaymentQuery(activePaymentStatus);

    const targetRole = searchParams.get('role') === 'staff' ? 'staff' : 'employee';
    let baseMatch: any = { role: targetRole, ...dateQuery };
    await applyRegionalFilter(baseMatch, session);
    if (district && district !== 'all') baseMatch.district = district;
    if (vendorCode) baseMatch.vendorCode = vendorCode;
    if (subVendorCode) baseMatch.subVendorCode = subVendorCode;

    if (offerLetterFilter === 'generated' || offerLetterFilter === 'not_generated') {
      const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
      const generatedIds = await EmployeeOfferLetter.find({}, 'employeeId').lean();
      const employeeIdsWithOl = generatedIds.map((ol: any) => ol.employeeId);
      
      if (offerLetterFilter === 'generated') {
        baseMatch._id = { $in: employeeIdsWithOl };
      } else {
        baseMatch._id = { $nin: employeeIdsWithOl };
      }
    }

    if (search) {
      const parentPartners = await User.find({
        role: { $in: ['vendor', 'sub_vendor'] },
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { vendorCode: { $regex: search, $options: 'i' } },
          { subVendorCode: { $regex: search, $options: 'i' } }
        ]
      }, '_id').lean();
      const parentPartnerIds = parentPartners.map(p => p._id);

      baseMatch.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { parentVendorId: { $in: parentPartnerIds } }
      ];
    }

    const counts = await employeeStatsService(baseMatch, activeStatus || undefined, activePaymentStatus || undefined);

    const data = await User.find({
      ...baseMatch,
      ...statusFilterQuery,
      ...paymentFilterQuery
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Auto-assign employeeId to staff users who don't have one
    if (targetRole === 'staff') {
      for (const u of data) {
        if (!u.employeeId) {
          const generatedId = `SHSTF${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          u.employeeId = generatedId;
          await User.updateOne({ _id: u._id }, { $set: { employeeId: generatedId } });
        }
      }
    }

    const resultFacet = { data };

    const populatedEmployees = await User.populate(resultFacet.data, {
      path: 'parentVendorId',
      select: 'fullName role parentVendorId',
      populate: {
        path: 'parentVendorId',
        select: 'fullName role'
      }
    });

    const employees = JSON.parse(JSON.stringify(populatedEmployees));

    const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
    const employeeIds = employees.map((emp: any) => emp._id);
    const offerLetters = await EmployeeOfferLetter.find({ employeeId: { $in: employeeIds } }).lean();
    
    const offerLetterMap = offerLetters.reduce((acc: any, ol: any) => {
      acc[ol.employeeId.toString()] = ol;
      return acc;
    }, {});

    const enrichedEmployees = employees.map((emp: any) => ({
      ...emp,
      offerLetterDetails: offerLetterMap[emp._id.toString()] || null,
      appointmentDetails: offerLetterMap[emp._id.toString()] || null
    }));

    const sessionUser = session as any;
    const hasCredentialsView = sessionUser.role === 'super_admin' || 
      (Array.isArray(sessionUser.permissions) && sessionUser.permissions.includes('credentials.view'));
    const hasDocumentsView = sessionUser.role === 'super_admin' || 
      (Array.isArray(sessionUser.permissions) && sessionUser.permissions.includes('documents.view'));

    const sanitizedData = sanitizeUserListForClient(enrichedEmployees, hasCredentialsView, hasDocumentsView);

    return Response.json({
      success: true,
      data: sanitizedData,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
