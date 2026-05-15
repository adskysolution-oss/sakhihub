import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Membership from '@/models/Membership';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { notifyMembershipPayment } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    const { memberId, groupId, paymentMode } = body;
    console.log('Membership POST body:', { memberId, groupId, paymentMode });

    // Verify member exists
    const member = await WomenMember.findById(memberId);
    if (!member) return errorResponse('Member not found', 404);

    // Check if membership already exists
    const existing = await Membership.findOne({ memberId });
    if (existing && existing.paymentStatus === 'Paid') {
      return errorResponse('Member already has an active membership', 400);
    }

    // Generate Membership ID and Receipt Number with timestamp for uniqueness
    const count = await Membership.countDocuments();
    const year = new Date().getFullYear();
    const ts = Date.now().toString().slice(-4);
    const membershipId = `SH-${year}-${1000 + count + 1}-${ts}`;
    const receiptNumber = `REC-${year}-${2000 + count + 1}-${ts}`;

    const membership = await Membership.create({
      membershipId,
      receiptNumber,
      memberId,
      groupId: groupId || null, // Use null for optional fields to satisfy validation
      employeeId: (session as any).id,
      amount: 100,
      paymentMode,
      paymentStatus: 'Paid',
      paymentDate: new Date()
    });
    console.log('Membership created successfully:', membership._id);

    // Update member status
    await WomenMember.findByIdAndUpdate(memberId, { membershipStatus: 'paid' });

    // Trigger Email Notification asynchronously
    notifyMembershipPayment(membership._id);

    return successResponse(membership, 'Membership created successfully', 201);
  } catch (error: any) {
    console.error('Membership Creation Error:', error);
    return errorResponse(error.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = (session as any).role;
    const userId = (session as any).id;
    
    let query: any = {};
    if (role === 'employee') {
      query.employeeId = userId;
    }

    const memberships = await Membership.find(query)
      .populate('memberId', 'name mobile')
      .populate('groupId', 'groupName village')
      .sort({ createdAt: -1 });

    return successResponse(memberships);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
