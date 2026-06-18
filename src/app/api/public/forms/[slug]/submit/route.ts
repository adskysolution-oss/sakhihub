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

    // Check for duplicates
    // 1. If user is logged in, check by userId
    if (userId) {
      const existingByUser = await FormResponse.findOne({ formId: form._id, userId });
      if (existingByUser) {
        return NextResponse.json({ success: false, message: 'You have already submitted this form' }, { status: 400 });
      }
    }

    // 2. Check by unique identifying fields (email, phone, mobile, aadhaar, pan)
    for (const step of form.steps) {
      for (const field of step.fields) {
        const fieldId = field.fieldId;
        const submittedValue = responses[fieldId];
        
        if (!submittedValue) continue;

        const isEmailField = field.type === 'email' || fieldId.toLowerCase().includes('email');
        const isPhoneField = field.type === 'phone' || fieldId.toLowerCase().includes('phone') || fieldId.toLowerCase().includes('mobile') || fieldId.toLowerCase().includes('contact');
        const isUniqueDocField = fieldId.toLowerCase().includes('aadhaar') || fieldId.toLowerCase().includes('pan') || fieldId.toLowerCase().includes('roll');

        if (isEmailField || isPhoneField || isUniqueDocField) {
          const queryKey = `responses.${fieldId}`;
          const existingDuplicate = await FormResponse.findOne({
            formId: form._id,
            [queryKey]: submittedValue
          });

          if (existingDuplicate) {
            return NextResponse.json({ 
              success: false, 
              message: `A submission with this ${field.label} already exists.` 
            }, { status: 400 });
          }
        }
      }
    }

    const newResponse = new FormResponse({
      formId: form._id,
      userId: userId,
      responses: responses,
      status: 'Submitted',
      formVersion: form.version || 1
    });
    
    await newResponse.save();
    return NextResponse.json({ success: true, message: 'Response submitted successfully', data: newResponse });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
