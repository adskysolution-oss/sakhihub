import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import { 
  buildStatusQuery, 
  buildPaymentQuery, 
  buildPaginationAndCountsFacet, 
  parseCountsFromFacet 
} from '@/utils/filterHelpers';

export interface DashboardStats {
  status: {
    all: number;
    pending: number;
    documents_uploaded: number;
    under_review: number;
    reupload_required: number;
    active: number;
    approved: number;
    rejected: number;
    unassigned: number;
    suspended: number;
  };
  payment: {
    all: number;
    paid: number;
    unpaid: number;
  };
}

/**
 * Centered service to calculate Employee Force counts.
 */
export async function employeeStatsService(baseMatch: any, activeStatus: string = 'all', activePaymentStatus: string = 'all'): Promise<DashboardStats> {
  const statusFilterQuery = buildStatusQuery(activeStatus);
  const paymentFilterQuery = buildPaymentQuery(activePaymentStatus);
  
  const facet = buildPaginationAndCountsFacet(1, 1, statusFilterQuery, paymentFilterQuery);
  const aggregationResult = await User.aggregate([
    { $match: baseMatch },
    { 
      $facet: {
        statusCounts: facet.statusCounts,
        paymentCounts: facet.paymentCounts
      } 
    }
  ]);

  const resultFacet = aggregationResult[0] || { statusCounts: [], paymentCounts: [] };
  const counts = parseCountsFromFacet(resultFacet) as DashboardStats;
  counts.status.unassigned = await User.countDocuments({
    ...baseMatch,
    $or: [{ parentVendorId: null }, { parentVendorId: { $exists: false } }]
  });
  return counts;
}

/**
 * Centered service to calculate Vendor counts.
 */
export async function vendorStatsService(baseMatch: any, activeStatus: string = 'all', activePaymentStatus: string = 'all'): Promise<DashboardStats> {
  const statusFilterQuery = buildStatusQuery(activeStatus);
  const paymentFilterQuery = buildPaymentQuery(activePaymentStatus);
  
  const facet = buildPaginationAndCountsFacet(1, 1, statusFilterQuery, paymentFilterQuery);
  const aggregationResult = await User.aggregate([
    { $match: baseMatch },
    { 
      $facet: {
        statusCounts: facet.statusCounts,
        paymentCounts: facet.paymentCounts
      } 
    }
  ]);

  const resultFacet = aggregationResult[0] || { statusCounts: [], paymentCounts: [] };
  const counts = parseCountsFromFacet(resultFacet) as DashboardStats;
  counts.status.unassigned = 0;
  return counts;
}

/**
 * Centered service to calculate Sub Vendor counts.
 */
export async function subVendorStatsService(baseMatch: any, activeStatus: string = 'all', activePaymentStatus: string = 'all'): Promise<DashboardStats> {
  const statusFilterQuery = buildStatusQuery(activeStatus);
  const paymentFilterQuery = buildPaymentQuery(activePaymentStatus);
  
  const facet = buildPaginationAndCountsFacet(1, 1, statusFilterQuery, paymentFilterQuery);
  const aggregationResult = await User.aggregate([
    { $match: baseMatch },
    { 
      $facet: {
        statusCounts: facet.statusCounts,
        paymentCounts: facet.paymentCounts
      } 
    }
  ]);

  const resultFacet = aggregationResult[0] || { statusCounts: [], paymentCounts: [] };
  const counts = parseCountsFromFacet(resultFacet) as DashboardStats;
  counts.status.unassigned = await User.countDocuments({
    ...baseMatch,
    $or: [{ parentVendorId: null }, { parentVendorId: { $exists: false } }]
  });
  return counts;
}

/**
 * Centered service to calculate Member counts.
 */
export async function memberStatsService(baseMatch: any, activeStatus: string = 'all', activePaymentStatus: string = 'all'): Promise<DashboardStats> {
  // Translate Member status filter queries
  let statusFilterQuery: any = {};
  if (activeStatus && activeStatus !== 'all') {
    if (activeStatus === 'pending') {
      statusFilterQuery = {
        $or: [
          { "userDoc.status": { $in: ['pending', 'documents_uploaded', 'under_review', 'reupload_required'] } },
          { 
            $and: [
              { "userDoc.status": { $exists: false } },
              { accountStatus: 'pending' }
            ]
          }
        ]
      };
    } else {
      statusFilterQuery = {
        $or: [
          { "userDoc.status": activeStatus },
          {
            $and: [
              { "userDoc.status": { $exists: false } },
              { accountStatus: activeStatus }
            ]
          }
        ]
      };
    }
  }

  // Translate Member payment filter queries
  let paymentFilterQuery: any = {};
  if (activePaymentStatus && activePaymentStatus !== 'all') {
    if (activePaymentStatus === 'paid') {
      paymentFilterQuery = { membershipStatus: 'paid' };
    } else if (activePaymentStatus === 'unpaid') {
      paymentFilterQuery = { membershipStatus: { $ne: 'paid' } };
    }
  }

  const aggregationResult = await WomenMember.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: "$mobile",
        doc: { $first: "$$ROOT" }
      }
    },
    { $replaceRoot: { newRoot: "$doc" } },
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
    {
      $facet: {
        statusCounts: [
          { $match: paymentFilterQuery },
          {
            $group: {
              _id: { $ifNull: ["$userDoc.status", { $ifNull: ["$accountStatus", "active"] }] },
              count: { $sum: 1 }
            }
          }
        ],
        paymentCounts: [
          { $match: statusFilterQuery },
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ["$membershipStatus", "paid"] },
                  "paid",
                  "unpaid"
                ]
              },
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);

  const facet = aggregationResult[0] || { statusCounts: [], paymentCounts: [] };
  
  const rawStatusCounts: Record<string, number> = {
    pending: 0,
    documents_uploaded: 0,
    under_review: 0,
    reupload_required: 0,
    active: 0,
    rejected: 0,
    suspended: 0
  };

  let totalStatusCount = 0;
  facet.statusCounts.forEach((item: any) => {
    totalStatusCount += item.count;
    if (item._id in rawStatusCounts) {
      rawStatusCounts[item._id] = item.count;
    }
  });

  const pendingSum = rawStatusCounts.pending + rawStatusCounts.documents_uploaded + rawStatusCounts.under_review + rawStatusCounts.reupload_required;

  const unassignedCountResult = await WomenMember.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: "$mobile",
        doc: { $first: "$$ROOT" }
      }
    },
    { $replaceRoot: { newRoot: "$doc" } },
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
    {
      $match: {
        $or: [
          { "userDoc.parentVendorId": null },
          { "userDoc.parentVendorId": { $exists: false } },
          { assignedEmployeeId: null },
          { assignedEmployeeId: { $exists: false } }
        ]
      }
    },
    { $count: "count" }
  ]);

  const counts = {
    status: {
      all: totalStatusCount,
      pending: pendingSum,
      documents_uploaded: rawStatusCounts.documents_uploaded,
      under_review: rawStatusCounts.under_review,
      reupload_required: rawStatusCounts.reupload_required,
      active: rawStatusCounts.active,
      approved: rawStatusCounts.approved || 0,
      rejected: rawStatusCounts.rejected,
      unassigned: unassignedCountResult[0]?.count || 0,
      suspended: rawStatusCounts.suspended || 0
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

  return counts as DashboardStats;
}
