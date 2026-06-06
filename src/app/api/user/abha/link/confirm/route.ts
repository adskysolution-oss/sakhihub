import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import AbhaCard from '@/models/AbhaCard';
import { ABDMAbhaService } from '@/services/abdmService';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    const { otp, transactionId } = await req.json();
    if (!otp || !transactionId) {
      return errorResponse('OTP and transaction ID are required', 400);
    }

    await dbConnect();

    // Final Duplicate Check: ensure user has no linked card
    const userId = (session as any).id;
    const existingUserCard = await AbhaCard.findOne({ userId });
    if (existingUserCard) {
      return errorResponse('An ABHA Card is already linked to your account.', 400);
    }

    // Confirm OTP with ABDM to get user specific token
    const userToken = await ABDMAbhaService.confirmVerification(otp.trim(), transactionId);

    // Retrieve official profile details using user-specific token
    const profile = await ABDMAbhaService.getProfile(userToken);

    const abhaNum = profile.healthIdNumber || profile.enrolmentNumber || profile.abhaNumber;
    if (!profile || !abhaNum) {
      return errorResponse('Could not retrieve ABHA profile details from ABDM.', 400);
    }

    // Final Idempotency Check: check if this specific ABHA Number is already linked to another user
    const checkAbhaNumber = abhaNum.trim().replace(/\s+/g, '');
    const abhaAddr = profile.healthId || profile.phrAddress?.[0] || `${abhaNum}@abdm`;
    
    const duplicateCard = await AbhaCard.findOne({
      $or: [
        { abhaNumber: checkAbhaNumber },
        { abhaAddress: abhaAddr.trim().toLowerCase() }
      ]
    });
    if (duplicateCard) {
      return errorResponse('This ABHA number/address is already linked to another SakhiHub account.', 400);
    }

    // Save record with verified official profile payload
    const abhaCard = await AbhaCard.create({
      userId,
      abhaNumber: abhaNum,
      abhaAddress: abhaAddr,
      status: 'linked',
      consentGiven: true,
      consentAt: new Date(),
      transactionId,
      profilePayload: {
        fullName: profile.name || profile.fullName || 'Verified ABHA Holder',
        gender: profile.gender || 'Unknown',
        dob: profile.dob || (profile.yearOfBirth ? `${profile.dayOfBirth || '01'}-${profile.monthOfBirth || '01'}-${profile.yearOfBirth}` : 'Unknown'),
        mobile: profile.mobile || 'Unknown',
        profilePhoto: profile.profilePhoto || profile.photo || ''
      }
    });

    return successResponse(abhaCard, 'ABHA card verified and linked successfully');
  } catch (error: any) {
    console.error('Link ABHA Confirm Error:', error);
    return errorResponse(error.message || 'Verification failed', 500);
  }
}
