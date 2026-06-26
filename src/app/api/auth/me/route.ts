import { getAuthSession, signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import dbConnect from '@/lib/mongodb';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

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
    let user = await UserModel.findOne({
      $or: [
        { _id: sessionUser.id },
        ...(sessionUser.mobile ? [{ mobile: sessionUser.mobile }] : []),
      ],
    }).select('-password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Evaluate and transition user activation status centrally
    const { evaluateUserActivation } = await import('@/services/activationService');
    user = await evaluateUserActivation(user._id.toString());

    let userObj = user.toObject();

    if (userObj.role === 'employee' || userObj.role === 'staff') {
      const EmployeeOfferLetter = (await import('@/models/EmployeeOfferLetter')).default;
      const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: user._id }).lean();
      if (offerLetter) {
        userObj.offerLetterDetails = offerLetter;
        
        // Sync/Heal User's employeeId to SHSTF/SHEMP format
        const expectedPrefix = user.role === 'employee' ? 'SHEMP' : 'SHSTF';
        const isCorrectFormat = typeof user.employeeId === 'string' && user.employeeId.startsWith(expectedPrefix) && user.employeeId.length === 11;
        
        if (!isCorrectFormat) {
          let suffix = '';
          if (offerLetter.offerLetterId && offerLetter.offerLetterId.includes('/')) {
            const parts = offerLetter.offerLetterId.split('/');
            suffix = parts[parts.length - 1];
          } else if (offerLetter.offerLetterId && offerLetter.offerLetterId.includes('-')) {
            const parts = offerLetter.offerLetterId.split('-');
            suffix = parts[parts.length - 1];
          }
          
          if (!suffix || suffix.length !== 6) {
            suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
          }
          
          const newId = `${expectedPrefix}${suffix}`;
          user.employeeId = newId;
          await user.save();
          userObj.employeeId = newId;
        }
      }
    } else if (['vendor', 'sub_vendor'].includes(userObj.role)) {
      const VendorAgreement = (await import('@/models/VendorAgreement')).default;
      const agreement = await VendorAgreement.findOne({ vendorId: user._id }).lean();
      if (agreement) {
        userObj.appointmentDetails = agreement;
        userObj.vendorAgreementDetails = agreement;
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
    const hasPaymentChanged = user.paymentCompleted !== sessionUser.paymentCompleted;
    const hasPermissionsChanged = JSON.stringify(user.permissions || []) !== JSON.stringify(sessionUser.permissions || []);
    const hasAssignmentsChanged = user.assignedScope !== sessionUser.assignedScope || 
                                  JSON.stringify(user.assignedStates || []) !== JSON.stringify(sessionUser.assignedStates || []) ||
                                  JSON.stringify(user.assignedDistricts || []) !== JSON.stringify(sessionUser.assignedDistricts || []) ||
                                  JSON.stringify(user.assignedRegions || []) !== JSON.stringify(sessionUser.assignedRegions || []);

    let responseData: any = userObj;
    if (user.role === 'member' && user.assignmentStatus !== 'completed') {
       const MemberRequest = (await import('@/models/MemberRequest')).default;
       const requests = await MemberRequest.find({ 
         memberId: user._id, 
         status: 'pending' 
       }).populate('employeeId', 'fullName mobile employeeId');
       
       responseData = {
         ...userObj,
         pendingRequests: requests
       };
    }

    const response = successResponse(responseData);

    // Set Cache-Control header to prevent any browser or Next.js router caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    if (hasStatusChanged || hasAccessChanged || hasAssignmentChanged || hasDocsVerifiedChanged || hasPaymentChanged || hasPermissionsChanged || hasAssignmentsChanged) {
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
        subVendorCode: user.subVendorCode,
        paymentCompleted: user.paymentCompleted,
        permissions: user.permissions || [],
        assignedScope: user.assignedScope || 'all',
        assignedStates: user.assignedStates || [],
        assignedDistricts: user.assignedDistricts || [],
        assignedRegions: user.assignedRegions || []
      };
      const newToken = signToken(newPayload);
      response.cookies.set('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Auth Me Sync Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    await dbConnect();
    const sessionUser = session as any;
    const body = await req.json();

    const UserModel = await getUserModel();
    const user = await UserModel.findById(sessionUser.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (body.vendorType !== undefined) {
      if (!['individual', 'company', 'ngo_trust'].includes(body.vendorType)) {
        return errorResponse('Invalid vendor type', 400);
      }
      user.vendorType = body.vendorType;
    }

    if (body.currentAddressSameAsAadhaar !== undefined) {
      user.currentAddressSameAsAadhaar = !!body.currentAddressSameAsAadhaar;
    }

    await user.save();

    return successResponse(user, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
