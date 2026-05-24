import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DynamicForm from '@/models/DynamicForm';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    const forms = await DynamicForm.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: forms });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    // Auto-generate slug
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let slugBase = body.slug;
      let counter = 1;
      while (await DynamicForm.findOne({ slug: body.slug })) {
        body.slug = `${slugBase}-${counter}`;
        counter++;
      }
    }
    
    const newForm = new DynamicForm({
      ...body,
      createdBy: session.id
    });
    
    await newForm.save();
    return NextResponse.json({ success: true, data: newForm });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
