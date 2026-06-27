import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SupportRequest from '@/models/SupportRequest';
import { getAuthSession } from '@/lib/auth';

async function isAuthorizedForSupport(session: any, action: 'view' | 'update') {
  if (!session) return false;
  
  const role = session.role;
  if (role === 'super_admin' || role === 'admin') {
    return true;
  }

  const userId = session.id || session.userId;
  const { hasPermission } = await import('@/utils/authHelpers');
  
  if (action === 'view') {
    return await hasPermission(userId, role, 'support.view') || 
           await hasPermission(userId, role, 'support.view_case');
  } else {
    return await hasPermission(userId, role, 'support.update_case') || 
           await hasPermission(userId, role, 'support.view');
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAuthorizedForSupport(session, 'view')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query: any = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await SupportRequest.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('GET Support Requests Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAuthorizedForSupport(session, 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id, status, adminNotes } = await req.json();
    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const request = await SupportRequest.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: request });
  } catch (error: any) {
    console.error('PATCH Support Requests Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAuthorizedForSupport(session, 'update')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    await SupportRequest.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Request deleted' });
  } catch (error: any) {
    console.error('DELETE Support Requests Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
