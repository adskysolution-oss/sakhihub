import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { translateDynamicData } from '@/lib/server-translate';

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
      const data = {
        applicationId: application.applicationId,
        status: application.status,
        appliedOn: application.createdAt
      };
      
      const lang = request.headers.get('x-language') || 'en';
      const translatedData = await translateDynamicData(data, lang, ['status']);

      return NextResponse.json({
        success: true,
        applied: true,
        data: translatedData
      });
    }

    return NextResponse.json({ success: true, applied: false });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
