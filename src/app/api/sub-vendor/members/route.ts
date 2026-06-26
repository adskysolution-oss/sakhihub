import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { 
  buildDateRangeQuery, 
  buildStatusQuery, 
  buildPaymentQuery, 
  resolveActiveStatuses 
} from '@/utils/filterHelpers';
import { memberStatsService } from '@/services/dashboardStatsService';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    
    const subVendor = await User.findById((session as any).id);
    if (!subVendor) return errorResponse('Sub-Vendor not found', 404);

    // Get employees under this sub-vendor
    const employees = await User.find({
      parentVendorId: subVendor._id,
      role: 'employee'
    }).select('_id');

    const employeeIds = employees.map(emp => emp._id);

    // Build query for WomenMember
    const queryOr: any[] = [];
    if (subVendor.subVendorCode) queryOr.push({ subVendorCode: subVendor.subVendorCode });
    if (employeeIds.length > 0) queryOr.push({ assignedEmployeeId: { $in: employeeIds } });
    queryOr.push({ createdBy: subVendor._id });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'all';
    const paymentStatus = searchParams.get('paymentStatus') || 'all';
    const dateRange = searchParams.get('dateRange');
    const customDate = searchParams.get('customDate');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let page = parseInt(searchParams.get('page') || '1', 10);
    let limit = parseInt(searchParams.get('limit') || '50', 10);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;

    const dateQuery = buildDateRangeQuery(dateRange, customDate, startDate, endDate);
    const { activeStatus, activePaymentStatus } = resolveActiveStatuses(status, paymentStatus);
    
    // Status Filter Query
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
      } else if (activeStatus === 'unassigned') {
        statusFilterQuery = {
          $or: [
            { "userDoc.parentVendorId": null },
            { "userDoc.parentVendorId": { $exists: false } },
            { assignedEmployeeId: null },
            { assignedEmployeeId: { $exists: false } }
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

    // Payment Filter Query
    let paymentFilterQuery: any = {};
    if (activePaymentStatus && activePaymentStatus !== 'all') {
      if (activePaymentStatus === 'paid') {
        paymentFilterQuery = { membershipStatus: 'paid' };
      } else if (activePaymentStatus === 'unpaid') {
        paymentFilterQuery = { membershipStatus: { $ne: 'paid' } };
      }
    }

    const baseMatch: any = { 
      $or: queryOr,
      accountStatus: { $ne: 'inactive' },
      ...dateQuery
    };

    if (search) {
      baseMatch.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { mobile: { $regex: search, $options: 'i' } },
            { village: { $regex: search, $options: 'i' } },
            { pincode: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const counts = await memberStatsService(baseMatch, activeStatus || undefined, activePaymentStatus || undefined);

    const rawMembers = await WomenMember.aggregate([
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
      { $match: { ...statusFilterQuery, ...paymentFilterQuery } },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]).allowDiskUse(true);

    const populatedMembers = await WomenMember.populate(rawMembers, [
      { path: 'groupId', select: 'groupName village district', model: Group },
      { path: 'assignedEmployeeId', select: 'fullName employeeId' }
    ]);

    return Response.json({
      success: true,
      data: populatedMembers,
      counts
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
