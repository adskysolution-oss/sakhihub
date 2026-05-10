import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import { successResponse, errorResponse } from '@/utils/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const campaigns = await Campaign.find({ status: 'active' }).sort({ createdAt: -1 });
    
    return successResponse(campaigns);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
