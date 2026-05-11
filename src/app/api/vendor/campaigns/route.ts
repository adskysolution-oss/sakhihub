import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // In a real scenario, we would find campaigns assigned to this vendor
    // For now, return active campaigns that are available for recruitment
    const campaigns = await Campaign.find({ status: 'active' });

    return successResponse(campaigns);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
