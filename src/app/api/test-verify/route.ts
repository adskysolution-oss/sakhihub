import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { evaluateUserActivation } from '@/services/activationService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Find the user: GAMPALA PRAVALLIKA
    const user = await User.findOne({
      $or: [
        { mobile: '9030962945' },
        { fullName: /PRAVALLIKA/i }
      ]
    });

    if (!user) {
      return NextResponse.json({ error: 'User GAMPALA PRAVALLIKA not found' }, { status: 404 });
    }

    const before = {
      id: user._id.toString(),
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      assignmentStatus: user.assignmentStatus,
      parentVendorId: user.parentVendorId,
      documentsVerified: user.documentsVerified,
      paymentCompleted: user.paymentCompleted,
      dashboardAccess: user.dashboardAccess,
      onboardingCompleted: user.onboardingCompleted
    };

    // Run centralized evaluation
    const updatedUser = await evaluateUserActivation(user._id.toString());

    const after = {
      id: updatedUser._id.toString(),
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      status: updatedUser.status,
      assignmentStatus: updatedUser.assignmentStatus,
      parentVendorId: updatedUser.parentVendorId,
      documentsVerified: updatedUser.documentsVerified,
      paymentCompleted: updatedUser.paymentCompleted,
      dashboardAccess: updatedUser.dashboardAccess,
      onboardingCompleted: updatedUser.onboardingCompleted
    };

    return NextResponse.json({
      success: true,
      before,
      after
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
