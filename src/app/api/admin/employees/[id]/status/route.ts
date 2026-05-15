import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';
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
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const body = await req.json();
    const { status, remarks } = body;

    await dbConnect();

    // 1. Handle overall status update (active/rejected/suspended)
    if (['active', 'rejected', 'suspended'].includes(status)) {
      const userToUpdate = await User.findById(id);
      if (!userToUpdate) return errorResponse('User not found', 404);

      const updateData: any = { 
        status, 
        updatedAt: new Date() 
      };

      // Set dashboard access and verification based on status
      if (status === 'active') {
        updateData.isVerified = true;
        
        // STRICT ACCESS RULE: Sub-vendors and Employees require BOTH document approval AND hierarchy assignment
        if (['sub_vendor', 'employee'].includes(userToUpdate.role)) {
           // Check actual documentsVerified flag or re-verify
           const allDocsOk = areAllDocsApproved(userToUpdate);
            if (allDocsOk && userToUpdate.assignmentStatus === 'completed' && userToUpdate.parentVendorId) {
              updateData.dashboardAccess = true;
              updateData.documentsVerified = true;
              updateData.onboardingCompleted = true;
            } else {
              // Mark as active but keep dashboard blocked until BOTH conditions are met
              updateData.dashboardAccess = false;
              updateData.documentsVerified = allDocsOk;
              updateData.onboardingCompleted = false;
            }
        } else {
           // Vendors and other roles get immediate access on activation
           updateData.dashboardAccess = true;
           updateData.documentsVerified = true;
        }
      } else {
        updateData.dashboardAccess = false;
      }

      if (remarks) updateData.remarks = remarks;

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      ).select('-password');
      
      return successResponse(updatedUser, `User status updated to ${status}`);
    }

    // 2. Handle specific document status update (doc:{type}:{status})
    if (status.startsWith('doc:')) {
      const parts = status.split(':');
      if (parts.length !== 3) return errorResponse('Invalid document status format', 400);
      
      const [, docType, docStatus] = parts;
      const validDocStatuses = ['approved', 'rejected', 'reupload_required'];
      
      if (!validDocStatuses.includes(docStatus)) {
        return errorResponse(`Invalid document status: ${docStatus}`, 400);
      }

      const user = await User.findById(id);
      if (!user) return errorResponse('User not found', 404);

      if (!user.documents) user.documents = {};
      const doc = (user.documents as any)[docType];
      
      if (!doc || !doc.url) return errorResponse('Document not uploaded yet — cannot review', 404);

      // Update doc metadata
      doc.status = docStatus;
      doc.reviewedAt = new Date();
      if (remarks) doc.remarks = remarks;
      if (docStatus === 'approved') doc.remarks = ''; // Clear remarks on approval

      // Auto-determine overall user status based on all doc statuses via Service
      user.status = determineUserStatus(user);
      
      // Sync documentsVerified flag based on overall compliance
      user.documentsVerified = areAllDocsApproved(user);

      // DUAL-GATE ACCESS LOGIC:
      // If all docs are approved AND hierarchy is already set (e.g. via referral),
      // we can automatically unlock dashboard access.
      if (user.documentsVerified && user.assignmentStatus === 'completed' && ['active', 'approved', 'documents_uploaded'].includes(user.status)) {
         user.dashboardAccess = true;
         user.onboardingCompleted = true;
      }
      
      user.markModified('documents');
      await user.save();

      return successResponse(user, `Document ${docType} status updated to ${docStatus}`);
    }

    return errorResponse('Invalid status type', 400);
  } catch (error: any) {
    console.error('Admin Status Update Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
