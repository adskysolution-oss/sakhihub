import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    const { parentVendorId, campaignId, vendorCode, subVendorCode } = await req.json();
    
    await dbConnect();

    const updateData: any = {
      assignmentStatus: 'completed'
    };

    if (parentVendorId) updateData.parentVendorId = parentVendorId;
    if (campaignId) updateData.campaignId = campaignId;
    if (vendorCode) updateData.vendorCode = vendorCode;
    if (subVendorCode) updateData.subVendorCode = subVendorCode;

    const user = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user, 'User hierarchy assignment completed successfully');
  } catch (error: any) {
    console.error('Assignment Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
