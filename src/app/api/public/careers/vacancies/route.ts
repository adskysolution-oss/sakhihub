import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';
import { translateDynamicData } from '@/lib/server-translate';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const status = searchParams.get('status') || 'Open';
    const limit = searchParams.get('limit');
    
    let query: any = {};
    if (status) query.status = status;
    if (featured === 'true') query.isFeatured = true;
    
    let vacanciesQuery = Vacancy.find(query).sort({ createdAt: -1 });
    if (limit) {
      vacanciesQuery = vacanciesQuery.limit(parseInt(limit));
    }
    
    const vacancies = await vacanciesQuery;
    
    const lang = request.headers.get('x-language') || 'en';
    const translatedVacancies = await translateDynamicData(vacancies, lang, [
      'title', 'department', 'location', 'aboutRole', 'responsibilities', 'requirements', 'perks'
    ]);
    
    return NextResponse.json({ success: true, data: translatedVacancies });
  } catch (error: any) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch vacancies' },
      { status: 500 }
    );
  }
}
