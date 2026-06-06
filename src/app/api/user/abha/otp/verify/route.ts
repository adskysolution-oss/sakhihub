import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import AbhaCard from '@/models/AbhaCard';
import User from '@/models/User';
import { ABDMAbhaService } from '@/services/abdmService';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    const { otp, transactionId, mobile } = await req.json();
    if (!otp || !transactionId) {
      return errorResponse('OTP and transaction ID are required', 400);
    }

    await dbConnect();

    // Check if user already has an ABHA Card
    const userId = (session as any).id;
    const existingUserCard = await AbhaCard.findOne({ userId });
    if (existingUserCard) {
      return errorResponse('An ABHA Card is already linked to your account.', 400);
    }

    // Retrieve user profile to get mobile number for verification
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User profile not found', 404);
    }

    const verificationMobile = mobile || user.mobile;
    console.log('[ABDM VERIFY DEBUG] Received from frontend body:', mobile);
    console.log('[ABDM VERIFY DEBUG] User mobile from DB:', user.mobile);
    console.log('[ABDM VERIFY DEBUG] Selected verification mobile:', verificationMobile);

    if (!verificationMobile) {
      return errorResponse('Mobile number is required for verification', 400);
    }

    // Verify OTP and complete enrollment with ABDM (V3 returns EnrolProfile directly)
    const profile = await ABDMAbhaService.verifyOtp(otp.trim(), transactionId, verificationMobile);

    const abhaNum = profile?.enrolmentNumber || profile?.abhaNumber || profile?.healthIdNumber;
    if (!profile || !abhaNum) {
      return errorResponse('ABHA Card generation completed, but profile could not be retrieved from ABDM.', 400);
    }

    // Final Idempotency Check: check if this specific ABHA Number is already linked to another user
    const checkAbhaNumber = abhaNum.trim().replace(/\s+/g, '');
    const abhaAddr = profile.phrAddress?.[0] || profile.abhaAddress || profile.healthId || `${abhaNum}@abdm`;
    
    const duplicateCard = await AbhaCard.findOne({
      $or: [
        { abhaNumber: checkAbhaNumber },
        { abhaAddress: abhaAddr.trim().toLowerCase() }
      ]
    });
    if (duplicateCard) {
      return errorResponse('This ABHA number/address is already linked to another SakhiHub account.', 400);
    }

    let fullName = profile.name || profile.fullName;
    if (!fullName) {
      const parts = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean);
      fullName = parts.join(' ') || 'New ABHA Holder';
    }

    // Save newly created official ABHA Card details
    const abhaCard = await AbhaCard.create({
      userId,
      abhaNumber: abhaNum,
      abhaAddress: abhaAddr,
      status: 'created',
      consentGiven: true,
      consentAt: new Date(),
      transactionId: transactionId,
      profilePayload: {
        fullName,
        gender: profile.gender || 'Unknown',
        dob: profile.dob || (profile.yearOfBirth ? `${profile.dayOfBirth || '01'}-${profile.monthOfBirth || '01'}-${profile.yearOfBirth}` : 'Unknown'),
        mobile: profile.mobile || 'Unknown',
        profilePhoto: profile.profilePhoto || profile.photo || ''
      }
    });

    return successResponse(abhaCard, 'ABHA card created and saved successfully');
  } catch (error: any) {
    console.error('Create ABHA Verify Error:', error);
    return errorResponse(error.message || 'Verification and creation failed', 500);
  }
}
