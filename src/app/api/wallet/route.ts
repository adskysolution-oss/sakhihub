import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import Wallet from '@/models/Wallet';
import WalletTransaction from '@/models/WalletTransaction';
import { syncWalletBalance } from '@/lib/commission';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const userId = (session as any).id;

    // Dynamically calculate and sync wallet balance
    const wallet = await syncWalletBalance(userId);

    // Fetch transaction history
    const transactions = await WalletTransaction.find({ userId })
      .populate('sourceUserId', 'fullName role')
      .sort({ createdAt: -1 });

    return successResponse({
      wallet,
      transactions
    }, 'Wallet details retrieved successfully');
  } catch (error: any) {
    console.error('Wallet GET Error:', error);
    return errorResponse(error.message || 'Failed to fetch wallet stats', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const userId = (session as any).id;
    const body = await req.json();
    const { amount, bankDetails } = body;

    const requestAmount = Number(amount);
    if (isNaN(requestAmount) || requestAmount <= 0) {
      return errorResponse('Invalid withdrawal amount', 400);
    }

    if (!bankDetails || !bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      return errorResponse('Missing mandatory bank details', 400);
    }

    // Lock and sync current wallet balance
    const wallet = await syncWalletBalance(userId);
    if (wallet.balance < requestAmount) {
      return errorResponse('Insufficient wallet balance. Please check active or pending withdrawals.', 400);
    }

    // Create a pending debit transaction (locks the balance immediately)
    const transaction = await WalletTransaction.create({
      walletId: wallet._id,
      userId,
      type: 'debit',
      category: 'withdrawal',
      amount: requestAmount,
      status: 'pending',
      description: `Withdrawal request of ₹${requestAmount} to Bank A/C: ${bankDetails.accountNumber}`,
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode,
        bankName: bankDetails.bankName || 'N/A',
        remarks: bankDetails.remarks || 'Standard payout request'
      },
      referenceId: `WD_REQ_${Date.now()}`
    });

    // Re-sync wallet balance to deduct locked balance immediately
    const updatedWallet = await syncWalletBalance(userId);

    return successResponse({
      wallet: updatedWallet,
      transaction
    }, 'Withdrawal request submitted successfully', 201);
  } catch (error: any) {
    console.error('Wallet Withdrawal POST Error:', error);
    return errorResponse(error.message || 'Failed to submit withdrawal request', 500);
  }
}
