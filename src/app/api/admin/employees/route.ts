import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

// GET all employees with filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const district = searchParams.get('district');
    const search = searchParams.get('search');
    const vendorCode = searchParams.get('vendorCode');
    const subVendorCode = searchParams.get('subVendorCode');
    const dateRange = searchParams.get('dateRange'); // 'all', 'today', 'yesterday', 'custom'
    const customDate = searchParams.get('customDate'); // 'YYYY-MM-DD'
    const startDate = searchParams.get('startDate'); // 'YYYY-MM-DD'
    const endDate = searchParams.get('endDate'); // 'YYYY-MM-DD'
    const paymentStatus = searchParams.get('paymentStatus'); // 'all', 'paid', 'unpaid'
    const offerLetterFilter = searchParams.get('offerLetter'); // 'all', 'generated', 'not_generated'

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    const dateQuery: any = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      
      if (dateRange === 'today') {
        dateQuery.createdAt = { $gte: startOfToday };
      } else if (dateRange === 'yesterday') {
        dateQuery.createdAt = { $gte: startOfYesterday, $lt: startOfToday };
      } else if (dateRange === 'custom') {
        const queryDate: any = {};
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          queryDate.$gte = start;
        } else if (customDate) {
          const start = new Date(customDate);
          start.setHours(0, 0, 0, 0);
          queryDate.$gte = start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          queryDate.$lte = end;
        } else if (customDate) {
          const end = new Date(customDate);
          end.setHours(23, 59, 59, 999);
          queryDate.$lte = end;
        }
        if (Object.keys(queryDate).length > 0) {
          dateQuery.createdAt = queryDate;
        }
      }
    }

    let activePaymentStatus = paymentStatus;
    let activeStatus = status;

    if (status === 'paid' || status === 'unpaid') {
      activePaymentStatus = status;
      activeStatus = 'all';
    }

    const baseMatch: any = { role: 'employee', ...dateQuery };
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

    // Status Filter Query
    let statusFilterQuery: any = {};
    if (activeStatus && activeStatus !== 'all') {
      if (activeStatus === 'pending') {
        statusFilterQuery = { status: { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] } };
      } else {
        statusFilterQuery = { status: activeStatus };
      }
    }

    // Payment Filter Query
    let paymentFilterQuery: any = {};
    if (activePaymentStatus && activePaymentStatus !== 'all') {
      if (activePaymentStatus === 'paid') {
        paymentFilterQuery = { $or: [{ paymentCompleted: true }, { subscriptionPaid: true }] };
      } else if (activePaymentStatus === 'unpaid') {
        paymentFilterQuery = {
          $and: [
            { paymentCompleted: { $ne: true } },
            { subscriptionPaid: { $ne: true } }
          ]
        };
      }
    }

    const aggregationResult = await User.aggregate([
      { $match: baseMatch },
      {
        $facet: {
          statusCounts: [
            { $match: paymentFilterQuery },
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          paymentCounts: [
            { $match: statusFilterQuery },
            {
              $group: {
                _id: {
                  $cond: [
                    { $or: [{ $eq: ["$paymentCompleted", true] }, { $eq: ["$subscriptionPaid", true] }] },
                    "paid",
                    "unpaid"
                  ]
                },
                count: { $sum: 1 }
              }
            }
          ],
          data: [
            { $match: { ...statusFilterQuery, ...paymentFilterQuery } },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ]
        }
      }
    ]);

    const facet = aggregationResult[0] || { statusCounts: [], paymentCounts: [], data: [] };
    
    const rawStatusCounts: Record<string, number> = {
      pending: 0,
      documents_uploaded: 0,
      under_review: 0,
      reupload_required: 0,
      active: 0,
      rejected: 0
    };
    
    let totalStatusCount = 0;
    facet.statusCounts.forEach((item: any) => {
      totalStatusCount += item.count;
      if (item._id in rawStatusCounts) {
        rawStatusCounts[item._id] = item.count;
      }
    });

    const pendingSum = rawStatusCounts.pending + rawStatusCounts.documents_uploaded + rawStatusCounts.under_review + rawStatusCounts.reupload_required;

    const counts = {
      status: {
        all: totalStatusCount,
        pending: pendingSum,
        documents_uploaded: rawStatusCounts.documents_uploaded,
        under_review: rawStatusCounts.under_review,
        reupload_required: rawStatusCounts.reupload_required,
        active: rawStatusCounts.active,
        rejected: rawStatusCounts.rejected
      },
      payment: {
        all: 0,
        paid: 0,
        unpaid: 0
      }
    };

    let totalPaymentCount = 0;
    facet.paymentCounts.forEach((item: any) => {
      totalPaymentCount += item.count;
      if (item._id === 'paid') counts.payment.paid = item.count;
      if (item._id === 'unpaid') counts.payment.unpaid = item.count;
    });
    counts.payment.all = totalPaymentCount;

    // Populate parentVendorId on employees data
    const populatedEmployees = await User.populate(facet.data, {
      path: 'parentVendorId',
      select: 'fullName'
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
      appointmentDetails: offerLetterMap[emp._id.toString()] || null // Fallback for some views that still use appointmentDetails for both
    }));

    return Response.json({
      success: true,
      data: enrichedEmployees,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
