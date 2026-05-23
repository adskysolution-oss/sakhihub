import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vacancy from '@/models/Vacancy';

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
    
    return NextResponse.json({ success: true, data: vacancy });
  } catch (error: any) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch vacancy details' },
      { status: 500 }
    );
  }
}
