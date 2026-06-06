import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ReportAuditLog from '@/models/ReportAuditLog';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    const logs = await ReportAuditLog.find()
      .populate('generatedBy', 'fullName email')
      .sort({ generatedAt: -1 })
      .limit(100) // retrieve latest 100 entries
      .lean();

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}
