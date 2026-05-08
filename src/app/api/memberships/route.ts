import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Membership from '@/models/Membership';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const { memberId, groupId, amount, paymentMode } = await req.json();
    
    // Generate Membership ID & Receipt Number
    const count = await Membership.countDocuments();
    const membershipId = `SHM-${new Date().getFullYear()}${String(count + 1).padStart(5, '0')}`;
    const receiptNumber = `RCP-${Date.now()}`;

    const membership = await Membership.create({
      membershipId,
      receiptNumber,
      memberId,
      groupId,
      employeeId: (session as any).id,
      amount: amount || 100,
      paymentMode,
      paymentStatus: 'Paid', // Assuming success for cash/manual entry in v1
      paymentDate: new Date(),
    });

    // Update member status
    await WomenMember.findByIdAndUpdate(memberId, { membershipStatus: 'paid' });

    return successResponse(membership, 'Payment collected successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const role = (session as any).role;
    const userId = (session as any).id;

    let query: any = {};
    if (role === 'employee') query.employeeId = userId;

    const memberships = await Membership.find(query)
      .sort({ createdAt: -1 })
      .populate('memberId', 'name mobile')
      .populate('groupId', 'groupName');

    return successResponse(memberships);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
