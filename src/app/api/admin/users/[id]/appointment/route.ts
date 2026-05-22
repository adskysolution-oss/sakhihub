import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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

    // Generate Agreement ID
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const agreementId = `SH-AGR-${randomStr}`;

    const appointmentDetails = {
      joiningDate: new Date(joiningDate),
      salary,
      generatedDate: new Date(),
      agreementId,
      status: 'generated'
    };

    user.appointmentDetails = appointmentDetails;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Appointment letter generated successfully',
      data: user
    });

  } catch (error: any) {
    console.error('Generate Appointment Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate appointment letter' }, { status: 500 });
  }
}
