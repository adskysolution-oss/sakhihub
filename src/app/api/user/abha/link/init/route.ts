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

    const { healthId } = await req.json();
    if (!healthId) {
      return errorResponse('ABHA number or ABHA address is required', 400);
    }

    await dbConnect();

    // Duplicate Check: Check if current user already has an ABHA card
    const existingUserCard = await AbhaCard.findOne({ userId: (session as any).id });
    if (existingUserCard) {
      return errorResponse('An ABHA Card is already linked to your account.', 400);
    }

    // Idempotency/Duplicate Check: Check if this ABHA identifier is linked to anyone else
    const normalizedId = healthId.trim().replace(/\s+/g, '');
    const duplicateCard = await AbhaCard.findOne({
      $or: [
        { abhaNumber: normalizedId },
        { abhaAddress: healthId.trim().toLowerCase() }
      ]
    });
    if (duplicateCard) {
      return errorResponse('This ABHA number or address is already linked to another SakhiHub account.', 400);
    }

    // Initialize ownership verification via ABDM
    const txnId = await ABDMAbhaService.initVerification(healthId.trim());

    return successResponse({ txnId }, 'Verification OTP sent to Aadhaar-linked mobile number successfully');
  } catch (error: any) {
    console.error('Link ABHA Init Error:', error);
    return errorResponse(error.message || 'Failed to initialize verification', 500);
  }
}
