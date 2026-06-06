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

    const { aadhaarNumber, consent } = await req.json();
    if (!aadhaarNumber) {
      return errorResponse('Aadhaar number is required', 400);
    }
    if (!consent) {
      return errorResponse('Consent is mandatory for ABHA Card generation', 400);
    }

    await dbConnect();

    // Check if user already has an ABHA Card
    const userId = (session as any).id;
    const existingUserCard = await AbhaCard.findOne({ userId });
    if (existingUserCard) {
      return errorResponse('An ABHA Card is already linked to your account.', 400);
    }

    // Call ABDM to generate Aadhaar OTP
    const txnId = await ABDMAbhaService.generateOtp(aadhaarNumber.trim());

    return successResponse({ txnId }, 'OTP generated and sent to Aadhaar-linked mobile number successfully');
  } catch (error: any) {
    console.error('Create ABHA OTP Generate Error:', error);
    return errorResponse(error.message || 'Failed to generate OTP', 500);
  }
}
