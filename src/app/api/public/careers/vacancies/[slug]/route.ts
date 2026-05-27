import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import { translateDynamicData } from '@/lib/server-translate';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();
    
    const vacancy = await Vacancy.findOne({ slug });
    
    if (!vacancy) {
      return NextResponse.json(
        { success: false, message: 'Vacancy not found' },
        { status: 404 }
      );
    }
    
    const lang = request.headers.get('x-language') || 'en';
    const translatedVacancy = await translateDynamicData(vacancy, lang, [
      'title', 'department', 'location', 'aboutRole', 'responsibilities', 'requirements', 'perks'
    ]);
    
    return NextResponse.json({ success: true, data: translatedVacancy });
  } catch (error: any) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch vacancy details' },
      { status: 500 }
    );
  }
}
