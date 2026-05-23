import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';

export async function GET(request: Request) {
  try {
    await connectDB();
    const vacancies = await Vacancy.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: vacancies });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      // Ensure uniqueness
      let slugBase = body.slug;
      let counter = 1;
      while (await Vacancy.findOne({ slug: body.slug })) {
        body.slug = `${slugBase}-${counter}`;
        counter++;
      }
    }
    
    const newVacancy = new Vacancy(body);
    await newVacancy.save();
    
    return NextResponse.json({ success: true, data: newVacancy });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
