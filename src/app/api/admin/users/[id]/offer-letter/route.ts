import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import { getAuthSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const currentUserId = session.id || session.userId;
    const { hasPermission } = await import('@/utils/authHelpers');
    const isAuthorized = session.role === 'super_admin' || 
      session.role === 'admin' ||
      await hasPermission(currentUserId, session.role, 'offer_letters.generate');

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient Permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { joiningDate, salary, travelAllowance, performanceIncentives, membershipIncentives, coordinatorType, assignedRegions } = body;

    if (!joiningDate || !salary) {
      return NextResponse.json({ success: false, message: 'Joining date and salary are required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Generate Offer Letter ID
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const offerLetterId = user.designation === 'Trainer'
      ? `SH/TRN/2026/${randomStr}`
      : `SH-OFR-${randomStr}`;

    const offerLetterDetails = {
      employeeId: user._id,
      joiningDate: new Date(joiningDate),
      salary,
      travelAllowance,
      performanceIncentives,
      membershipIncentives,
      coordinatorType,
      assignedRegions,
      generatedDate: new Date(),
      offerLetterId,
      status: 'generated',
      digitalAcceptanceStatus: false,
      pdfUrl: `/employee-offer-letter/${user._id}`
    };

    const updatedOfferLetter = await EmployeeOfferLetter.findOneAndUpdate(
      { employeeId: user._id },
      offerLetterDetails,
      { upsert: true, new: true, runValidators: true }
    );

    // Reset email sent flag on user and trigger notification
    user.offerLetterEmailSent = false;
    await user.save();

    const { NotificationService, NotificationEvent } = await import('@/lib/notifications');
    await NotificationService.trigger(NotificationEvent.OFFER_LETTER_GENERATED, { userId: user._id });

    const updatedUser = await User.findById(id).lean();
    const userToReturn = {
      ...updatedUser,
      offerLetterDetails: updatedOfferLetter
    };

    return NextResponse.json({
      success: true,
      message: 'Employee offer letter generated successfully',
      data: userToReturn
    });

  } catch (error: any) {
    console.error('Generate Offer Letter Error:', error);
    return NextResponse.json({ success: false, message: `Failed to generate employee offer letter: ${error.message || error}` }, { status: 500 });
  }
}
