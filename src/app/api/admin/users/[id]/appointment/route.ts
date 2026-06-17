import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VendorAgreement from '@/models/VendorAgreement';
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
    const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');
    const isAuthorized = session.role === 'super_admin' || 
      session.role === 'admin' ||
      await hasPermission(currentUserId, session.role, 'offer_letters.generate');

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient Permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { joiningDate, salary } = body;

    if (!joiningDate || !salary) {
      return NextResponse.json({ success: false, message: 'Joining date and salary are required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    if (!(session.role === 'super_admin' || session.role === 'admin' || await checkRegionalScope(user, session))) {
      return NextResponse.json({ success: false, message: 'Forbidden: Target user is out of regional scope' }, { status: 403 });
    }

    // Generate Agreement ID
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const agreementId = `SH-AGR-${randomStr}`;

    const vendorAgreementDetails = {
      vendorId: user._id,
      vendorCode: user.vendorCode || user.subVendorCode,
      joiningDate: new Date(joiningDate),
      salary,
      generatedDate: new Date(),
      agreementId,
      status: 'generated',
      isLocked: false,
      fileUrl: `/appointment-letter/${user._id}`
    };

    const updatedAgreement = await VendorAgreement.findOneAndUpdate(
      { vendorId: user._id },
      vendorAgreementDetails,
      { upsert: true, returnDocument: 'after' }
    );

    const updatedUser = await User.findById(id).lean();
    const userToReturn = {
      ...updatedUser,
      appointmentDetails: updatedAgreement,
      vendorAgreementDetails: updatedAgreement
    };

    return NextResponse.json({
      success: true,
      message: 'Appointment letter generated successfully',
      data: userToReturn
    });

  } catch (error: any) {
    console.error('Generate Appointment Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate appointment letter' }, { status: 500 });
  }
}
