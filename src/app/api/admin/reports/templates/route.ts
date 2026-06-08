import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ReportTemplate from '@/models/ReportTemplate';
import { getAuthSession } from '@/lib/auth';

// GET: Retrieve all saved report configurations/templates
export async function GET(req: NextRequest) {
  try {
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('reports.view');
    if (!authorized) return error;

    await dbConnect();

    const templates = await ReportTemplate.find()
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST: Save a new template manually
export async function POST(req: NextRequest) {
  try {
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('reports.view');
    if (!authorized) return error;

    await dbConnect();
    const sessionUser = session as any;
    const currentUserId = sessionUser.id || sessionUser.userId;

    const body = await req.json();
    const { name, entityType, filters, selectedFields, format } = body;

    if (!name || !entityType || !selectedFields || selectedFields.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    const template = await ReportTemplate.create({
      name,
      entityType,
      filters,
      selectedFields,
      format,
      createdBy: currentUserId
    });

    return NextResponse.json({ success: true, message: 'Template saved successfully', data: template });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to save template' }, { status: 500 });
  }
}

// DELETE: Remove a saved template
export async function DELETE(req: NextRequest) {
  try {
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('reports.view');
    if (!authorized) return error;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Template ID is required' }, { status: 400 });
    }

    await ReportTemplate.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete template' }, { status: 500 });
  }
}