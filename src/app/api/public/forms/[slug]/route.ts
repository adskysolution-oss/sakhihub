import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DynamicForm from '@/models/DynamicForm';
import { translateDynamicData } from '@/lib/server-translate';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    await connectDB();
    
    const form = await DynamicForm.findOne({ slug, isActive: true }).lean();
    if (!form) return NextResponse.json({ success: false, message: 'Form not found or inactive' }, { status: 404 });
    
    const lang = request.headers.get('x-language') || 'en';
    const translatedForm = await translateDynamicData(form, lang, ['title', 'description', 'label', 'placeholder', 'helpText']);

    return NextResponse.json({ success: true, data: translatedForm });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
