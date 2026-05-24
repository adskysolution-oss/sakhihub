import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FormResponse from '@/models/FormResponse';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    
    // In a real scenario, you might want to populate userId if applicable
    const responses = await FormResponse.find({ formId: id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: responses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
