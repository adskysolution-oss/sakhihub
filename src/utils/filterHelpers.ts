import { Types } from 'mongoose';

export function buildDateRangeQuery(dateRange?: string | null, customDate?: string | null, startDate?: string | null, endDate?: string | null) {
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
  return dateQuery;
}

export function buildStatusQuery(activeStatus?: string | null) {
  let statusFilterQuery: any = {};
  if (activeStatus && activeStatus !== 'all') {
    if (activeStatus === 'pending') {
      statusFilterQuery = { status: { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] } };
    } else {
      statusFilterQuery = { status: activeStatus };
    }
  }
  return statusFilterQuery;
}

export function buildPaymentQuery(activePaymentStatus?: string | null) {
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
  return paymentFilterQuery;
}

export function buildPaginationAndCountsFacet(page: number, limit: number, statusFilterQuery: any, paymentFilterQuery: any) {
  return {
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
      { $sort: { createdAt: -1 as const } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]
  };
}

export function parseCountsFromFacet(facet: any) {
  const rawStatusCounts: Record<string, number> = {
    pending: 0,
    documents_uploaded: 0,
    under_review: 0,
    reupload_required: 0,
    active: 0,
    approved: 0,
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
      approved: rawStatusCounts.approved,
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

  return counts;
}

export function resolveActiveStatuses(status?: string | null, paymentStatus?: string | null) {
  let activePaymentStatus = paymentStatus;
  let activeStatus = status;

  if (status === 'paid' || status === 'unpaid') {
    activePaymentStatus = status;
    activeStatus = 'all';
  }

  return { activeStatus, activePaymentStatus };
}
