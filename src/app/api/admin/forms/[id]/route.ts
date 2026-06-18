import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DynamicForm from '@/models/DynamicForm';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && (session.permissions?.includes('forms.view') || session.permissions?.includes('forms.manage'))))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const form = await DynamicForm.findById(id);
    if (!form) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: form });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && session.permissions?.includes('forms.manage')))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const body = await request.json();
    
    const form = await DynamicForm.findById(id);
    if (!form) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    // Compare steps/fields structures to determine if version should increment
    const normalizeStructure = (steps: any[]) => {
      return (steps || []).map((s: any) => ({
        title: s.title || '',
        description: s.description || '',
        fields: (s.fields || []).map((f: any) => ({
          fieldId: f.fieldId,
          label: f.label || '',
          type: f.type || 'text',
          required: !!f.required,
          options: Array.isArray(f.options) ? [...f.options].sort() : []
        }))
      }));
    };

    const oldStructure = JSON.stringify(normalizeStructure(form.steps));
    const newStructure = JSON.stringify(normalizeStructure(body.steps));

    if (oldStructure !== newStructure) {
      body.version = (form.version || 1) + 1;
    } else {
      body.version = form.version || 1;
    }

    const updated = await DynamicForm.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && session.permissions?.includes('forms.manage')))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const deleted = await DynamicForm.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
