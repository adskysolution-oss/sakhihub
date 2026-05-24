import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DynamicForm from '@/models/DynamicForm';
import FormResponse from '@/models/FormResponse';
import { getAuthSession } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectDB();
    
    const form = await DynamicForm.findOne({ slug, isActive: true });
    if (!form) return NextResponse.json({ success: false, message: 'Form not found or inactive' }, { status: 404 });
    
    const body = await request.json();
    const responses = body.responses;

    // Optional: Extract userId if logged in (this requires your auth logic)
    const session = await getAuthSession() as any;
    const userId = session?.id || null;

    const newResponse = new FormResponse({
      formId: form._id,
      userId: userId,
      responses: responses,
      status: 'Submitted'
    });
    
    await newResponse.save();
    return NextResponse.json({ success: true, message: 'Response submitted successfully', data: newResponse });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
