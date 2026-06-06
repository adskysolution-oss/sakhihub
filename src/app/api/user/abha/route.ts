import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import AbhaCard from '@/models/AbhaCard';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Not authenticated', 401);
    }

    await dbConnect();
    const abhaCard = await AbhaCard.findOne({ userId: (session as any).id });
    const user = await User.findById((session as any).id);

    return successResponse({ 
      hasAbha: !!abhaCard, 
      abhaCard,
      userMobile: user?.mobile || ''
    }, 'ABHA card details fetched successfully');
  } catch (error: any) {
    console.error('Fetch User ABHA Error:', error);
    return errorResponse(error.message || 'Failed to fetch ABHA details', 500);
  }
}
