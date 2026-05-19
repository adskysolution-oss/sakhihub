import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import PaymentTransaction from '@/models/PaymentTransaction';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();

    // Fetch all successful transactions for this user
    const transactions = await PaymentTransaction.find({ 
      userId: (session as any).id,
      status: 'paid'
    })
      .populate('userId', 'fullName mobile')
      .sort({ paidAt: -1 })
      .lean();

    return successResponse(transactions, 'Payment receipts retrieved');
  } catch (error: any) {
    console.error('Fetch Receipts Error:', error);
    return errorResponse(error.message || 'Failed to fetch receipts', 500);
  }
}
