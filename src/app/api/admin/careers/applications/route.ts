import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get('vacancyId');
    const status = searchParams.get('status');
    
    let query: any = {};
    if (vacancyId) query.vacancyId = vacancyId;
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('vacancyId', 'title department')
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
