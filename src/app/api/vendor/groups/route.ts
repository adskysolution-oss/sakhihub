import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const _Campaign = (await import('@/models/Campaign')).default; // Ensure Campaign is registered
    
    const vendor = await User.findById((session as any).id);
    if (!vendor) return errorResponse('Vendor not found', 404);

    // Fetch groups directly associated with this vendor's code
    const groups = await Group.find({ vendorCode: vendor.vendorCode })
      .populate('createdBy', 'fullName employeeId vendorCode subVendorCode')
      .populate('campaignId', 'title');

    return successResponse(groups);
  } catch (error: any) {
    console.error('Vendor Groups Error:', error);
    return errorResponse(error.message, 500);
  }
}
