import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');
    const vacancyId = searchParams.get('vacancyId');

    if (!mobile || !vacancyId) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    const application = await Application.findOne({ mobile, vacancyId });

    if (application) {
      return NextResponse.json({
        success: true,
        applied: true,
        data: {
          applicationId: application.applicationId,
          status: application.status,
          appliedOn: application.createdAt
        }
      });
    }

    return NextResponse.json({ success: true, applied: false });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
