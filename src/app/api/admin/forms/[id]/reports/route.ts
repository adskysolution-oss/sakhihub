import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import FormReport from '@/models/FormReport';
import User from '@/models/User';
import '@/models/Campaign';
import '@/models/Group';
import '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && session.permissions?.includes('forms.export')))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const reports = await FormReport.find({ formId: new mongoose.Types.ObjectId(id) })
      .populate('generatedBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && session.permissions?.includes('forms.manage')))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { formVersion, reportType, fileUrl } = body;

    if (!formVersion || !reportType || !fileUrl) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const newReport = new FormReport({
      formId: new mongoose.Types.ObjectId(id),
      formVersion,
      reportType,
      generatedBy: new mongoose.Types.ObjectId(session.id),
      fileUrl
    });

    await newReport.save();
    return NextResponse.json({ success: true, data: newReport });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
