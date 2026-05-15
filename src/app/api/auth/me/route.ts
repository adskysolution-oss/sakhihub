import { getAuthSession, signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import dbConnect from '@/lib/mongodb';

const getUserModel = async () => (await import('@/models/User')).default as any;

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    await dbConnect();
    const sessionUser = session as any;
    const UserModel = await getUserModel();
    const user = await UserModel.findOne({
      $or: [
        { _id: sessionUser.id },
        ...(sessionUser.mobile ? [{ mobile: sessionUser.mobile }] : []),
      ],
    }).select('-password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // SELF-HEALING: If documents are approved but flag is false, fix it now.
    // This handles users who were approved before the strict dual-gate logic was finalized.
    if (!user.documentsVerified && ['sub_vendor', 'employee'].includes(user.role)) {
       const { areAllDocsApproved } = await import('@/lib/docs/service');
       if (areAllDocsApproved(user)) {
         user.documentsVerified = true;
         if (user.assignmentStatus === 'completed' && ['active', 'approved'].includes(user.status)) {
           user.dashboardAccess = true;
           user.onboardingCompleted = true;
         }
         await user.save();
       }
    }

    // AUTH SYNC LOGIC: 
    // If the database state (dashboardAccess, status, or hierarchy assignment) has changed 
    // since the token was issued, we need to update the token in the cookie to prevent 
    // the middleware from using stale data and blocking the user.
    const hasStatusChanged = user.status !== sessionUser.status;
    const hasAccessChanged = user.dashboardAccess !== sessionUser.dashboardAccess;
    const hasAssignmentChanged = user.assignmentStatus !== sessionUser.assignmentStatus;
    const hasDocsVerifiedChanged = user.documentsVerified !== sessionUser.documentsVerified;

    if (hasStatusChanged || hasAccessChanged || hasAssignmentChanged || hasDocsVerifiedChanged) {
      // Strip JWT metadata (iat, exp) from existing session to avoid conflict with signToken's expiresIn
      const { iat, exp, ...cleanPayload } = sessionUser;
      
      const newPayload = {
        ...cleanPayload,
        dashboardAccess: user.dashboardAccess,
        status: user.status,
        isVerified: user.isVerified,
        documentsVerified: user.documentsVerified,
        assignmentStatus: user.assignmentStatus,
        parentVendorId: user.parentVendorId,
        vendorCode: user.vendorCode,
        subVendorCode: user.subVendorCode
      };
      const newToken = signToken(newPayload);
      await setAuthCookie(newToken);
    }

    if (user.role === 'member' && user.assignmentStatus !== 'completed') {
       const MemberRequest = (await import('@/models/MemberRequest')).default;
       const requests = await MemberRequest.find({ 
         memberId: user._id, 
         status: 'pending' 
       }).populate('employeeId', 'fullName mobile employeeId');
       
       return successResponse({
         ...user.toObject(),
         pendingRequests: requests
       });
    }

    return successResponse(user);
  } catch (error) {
    console.error('Auth Me Sync Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
