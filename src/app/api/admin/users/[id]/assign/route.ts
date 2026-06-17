import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { areAllDocsApproved } from '@/lib/docs/service';

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

    // AUTO-UNLOCK RULE: 
    // If the user is a sub-vendor or employee and has already been "activated" by admin 
    // (status is 'active' or 'approved'), completing the hierarchy assignment should 
    // now automatically unlock dashboard access.
    if (['sub_vendor', 'employee'].includes(userToUpdate.role) && ['active', 'approved', 'documents_uploaded'].includes(userToUpdate.status)) {
       const docsOk = areAllDocsApproved(userToUpdate);
       if (docsOk) {
         updateData.documentsVerified = true;
         updateData.dashboardAccess = true;
         updateData.onboardingCompleted = true;
       } else {
         // Even if docs not fully approved, we set dashboardAccess true IF admin is manually assigning
         // but middleware will still block if documentsVerified is false.
         // Let's be consistent: only unlock if docs are ok.
         updateData.dashboardAccess = false; 
         updateData.documentsVerified = false;
       }
    }

    const user = await User.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    // Trigger Centralized Notifications
    const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
    if ('parentVendorId' in body && parentVendorId) {
      await NotificationService.trigger(NotificationEvent.PARENT_ASSIGNED, { userId: user._id });
    }
    if (('campaignId' in body && campaignId) || ('assignedCampaigns' in body)) {
      await NotificationService.trigger(NotificationEvent.CAMPAIGN_ASSIGNED, { userId: user._id });
    }
    if (user && user.status === 'active') {
      await NotificationService.trigger(NotificationEvent.ACCOUNT_ACTIVATED, { userId: user._id });
    }

    return successResponse(user, 'User hierarchy assignment completed successfully');
  } catch (error: any) {
    console.error('Assignment Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
