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
    if (!session || (session.role !== 'super_admin' && session.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
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

    // Generate Offer Letter ID
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const offerLetterId = `SH-OFR-${randomStr}`;

    const offerLetterDetails = {
      employeeId: user._id,
      joiningDate: new Date(joiningDate),
      salary,
      generatedDate: new Date(),
      offerLetterId,
      status: 'generated',
      digitalAcceptanceStatus: false,
      pdfUrl: `/employee-offer-letter/${user._id}`
    };

    const updatedOfferLetter = await EmployeeOfferLetter.findOneAndUpdate(
      { employeeId: user._id },
      offerLetterDetails,
      { upsert: true, returnDocument: 'after' }
    );

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
    return NextResponse.json({ success: false, message: 'Failed to generate employee offer letter' }, { status: 500 });
  }
}
