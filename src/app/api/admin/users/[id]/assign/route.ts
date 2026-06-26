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
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');
    const isAuthorized = sessionUser.role === 'super_admin' || 
      sessionUser.role === 'admin' ||
      await hasPermission(sessionUser.id, sessionUser.role, 'employees.update');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const body = await req.json();
    const { parentVendorId, campaignId, vendorCode, subVendorCode } = body;
    
    await dbConnect();

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return errorResponse('User not found', 404);
    }

    if (!(sessionUser.role === 'super_admin' || sessionUser.role === 'admin' || await checkRegionalScope(userToUpdate, session))) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    const updateData: any = {
      assignmentStatus: 'completed',
      updatedAt: new Date()
    };

    if ('parentVendorId' in body) updateData.parentVendorId = parentVendorId;
    if ('campaignId' in body) updateData.campaignId = campaignId;
    if ('vendorCode' in body) updateData.vendorCode = vendorCode;
    if ('subVendorCode' in body) updateData.subVendorCode = subVendorCode;

    const user = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    // Evaluate user activation status centrally
    const { evaluateUserActivation } = await import('@/services/activationService');
    const activatedUser = await evaluateUserActivation(id);

    // Trigger Centralized Notifications
    const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
    if ('parentVendorId' in body && parentVendorId) {
      await NotificationService.trigger(NotificationEvent.PARENT_ASSIGNED, { userId: user._id });
    }
    if (('campaignId' in body && campaignId) || ('assignedCampaigns' in body)) {
      await NotificationService.trigger(NotificationEvent.CAMPAIGN_ASSIGNED, { userId: user._id });
    }

    return successResponse(activatedUser, 'User hierarchy assignment completed successfully');
  } catch (error: any) {
    console.error('Assignment Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
