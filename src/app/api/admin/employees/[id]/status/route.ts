import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';
import Document from '@/models/Document';
import {
  REQUIRED_DOCS_BY_ROLE,
  determineUserStatus,
  areAllDocsApproved
} from '@/lib/docs/service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await req.json();
    const { status, remarks } = body;

    await dbConnect();
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) return errorResponse('User not found', 404);



    const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');

    if (!((session as any).role === 'super_admin' || (session as any).role === 'admin' || await checkRegionalScope(userToUpdate, session))) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    if (status.startsWith('doc:')) {
      const requiredPerm = status.endsWith(':approved') || status.endsWith(':exception_approved') ? 'documents.verify' : 'documents.reject';
      const isAuthorized = await hasPermission((session as any).id, (session as any).role, requiredPerm);
      if (!isAuthorized) return errorResponse('Forbidden: Insufficient Permissions', 403);
    } else {
      let requiredPerm = '';
      if (userToUpdate.role === 'vendor') requiredPerm = 'vendors.update';
      else if (userToUpdate.role === 'sub_vendor') requiredPerm = 'sub_vendors.update';
      else if (userToUpdate.role === 'employee') requiredPerm = 'employees.update';
      else if (userToUpdate.role === 'staff') requiredPerm = 'employees.update';
      else if (userToUpdate.role === 'member') requiredPerm = 'members.update';

      const isAuthorized = await hasPermission((session as any).id, (session as any).role, requiredPerm);
      if (!isAuthorized) return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    // 1. Handle overall status update (active/rejected/suspended)
    if (['active', 'rejected', 'suspended'].includes(status)) {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (remarks) updateData.remarks = remarks;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).select('-password');

      // Call centralized activation engine to check status transitions and sync flags
      const { evaluateUserActivation } = await import('@/services/activationService');
      const activatedUser = await evaluateUserActivation(id);

      // Auto-revoke authorization letters if user is no longer eligible
      const { syncAuthorizationLetterStatus } = await import('@/utils/authLetterSync');
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      await syncAuthorizationLetterStatus(id, ip);

      return successResponse(activatedUser, `User status updated to ${status}`);
    }

    // 2. Handle specific document status update (doc:{type}:{status})
    if (status.startsWith('doc:')) {
      const parts = status.split(':');
      if (parts.length !== 3) return errorResponse('Invalid document status format', 400);

      const [, docType, docStatus] = parts;
      const validDocStatuses = ['approved', 'rejected', 'reupload_required', 'exception_approved', 'on_hold'];

      if (!validDocStatuses.includes(docStatus)) {
        return errorResponse(`Invalid document status: ${docStatus}`, 400);
      }

      const user = await User.findById(id);
      if (!user) return errorResponse('User not found', 404);

      if (!user.documents) user.documents = {};
      const doc = (user.documents as any)[docType];

      // Allow review even if url is empty for exception requests
      if (!doc || (!doc.url && doc.status !== 'exception_requested' && doc.status !== 'on_hold' && doc.status !== 'exception_responded')) {
        return errorResponse('Document not uploaded yet — cannot review', 404);
      }

      // Update doc metadata
      doc.status = docStatus;
      doc.reviewedAt = new Date();
      if (remarks) {
        if (['on_hold', 'exception_approved', 'reupload_required'].includes(docStatus)) {
          doc.exceptionAdminRemarks = remarks;
        } else {
          doc.remarks = remarks;
        }
      }
      if (docStatus === 'approved' || docStatus === 'exception_approved') {
        doc.remarks = '';
        doc.exceptionAdminRemarks = '';
      }

      // Auto-determine overall user status based on all doc statuses via Service
      user.status = determineUserStatus(user);

      // Sync documentsVerified flag based on overall compliance
      user.documentsVerified = areAllDocsApproved(user);

      user.markModified('documents');
      await user.save();

      // Call centralized activation engine to check status transitions and sync flags
      const { evaluateUserActivation } = await import('@/services/activationService');
      const activatedUser = await evaluateUserActivation(id);

      // Auto-revoke authorization letters if user is no longer eligible
      const { syncAuthorizationLetterStatus } = await import('@/utils/authLetterSync');
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      await syncAuthorizationLetterStatus(id, ip);

      // Trigger Centralized Notifications
      const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
      if (['rejected', 'reupload_required'].includes(docStatus)) {
        await NotificationService.trigger(NotificationEvent.DOCUMENT_REJECTED, {
          userId: user._id,
          documentName: docType,
          reason: remarks
        });
      }
      if (user.documentsVerified) {
        await NotificationService.trigger(NotificationEvent.DOCUMENTS_VERIFIED, {
          userId: user._id
        });
      }

      // Sync to Document collection in MongoDB
      await Document.findOneAndUpdate(
        { userId: user._id, documentType: docType },
        {
          status: docStatus,
          verificationStatus: docStatus,
          reviewedAt: new Date(),
          adminRemarks: (docStatus === 'approved' || docStatus === 'exception_approved') ? '' : (remarks || ''),
          isApproved: docStatus === 'approved' || docStatus === 'exception_approved',
          isLocked: docStatus === 'approved' || docStatus === 'exception_approved'
        },
        { upsert: true }
      );

      return successResponse(activatedUser, `Document ${docType} status updated to ${docStatus}`);
    }

    return errorResponse('Invalid status type', 400);
  } catch (error: any) {
    console.error('Admin Status Update Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
