import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Vacancy from '@/models/Vacancy'; // ensure Vacancy model is loaded for populate
import { translateDynamicData } from '@/lib/server-translate';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const mobile = searchParams.get('mobile');

    if (!applicationId || !mobile) {
      return NextResponse.json({ success: false, message: 'Application ID and Mobile Number are required.' }, { status: 400 });
    }

    const application = await Application.findOne({ 
      applicationId: applicationId.trim().toUpperCase(),
      mobile: mobile.trim() 
    }).populate('vacancyId', 'title department location');

    if (!application) {
      return NextResponse.json({ success: false, message: 'Application not found. Please check your ID and Mobile Number.' }, { status: 404 });
    }

    const data = {
      applicationId: application.applicationId,
      vacancyTitle: application.vacancyId?.title || 'Unknown Vacancy',
      department: application.vacancyId?.department || '',
      location: application.vacancyId?.location || '',
      status: application.status,
      appliedDate: application.createdAt,
      adminRemarks: application.adminRemarks || '',
      fullName: application.fullName
    };

    const lang = request.headers.get('x-language') || 'en';
    const translatedData = await translateDynamicData(data, lang, ['vacancyTitle', 'department', 'location', 'status', 'adminRemarks']);

    return NextResponse.json({
      success: true,
      data: translatedData
    });

  } catch (error: any) {
    console.error('Error fetching application track:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
