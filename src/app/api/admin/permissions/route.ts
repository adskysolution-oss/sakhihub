import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Permission from '@/models/Permission';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export const DEFAULT_PERMISSIONS = [
  { key: 'documents.view', name: 'View Documents', module: 'Documents' },
  { key: 'documents.verify', name: 'Verify Documents', module: 'Documents' },
  { key: 'documents.reject', name: 'Reject Documents', module: 'Documents' },
  { key: 'credentials.view', name: 'View Sensitive Credentials (PII)', module: 'Credentials' },

  { key: 'offer_letters.view', name: 'View Offer Letters', module: 'Offer Letters' },
  { key: 'offer_letters.generate', name: 'Generate Offer Letters', module: 'Offer Letters' },
  { key: 'offer_letters.download', name: 'Download Offer Letters', module: 'Offer Letters' },

  { key: 'agreements.view', name: 'View Agreements', module: 'Agreements' },
  { key: 'agreements.generate', name: 'Generate Agreements', module: 'Agreements' },
  { key: 'agreements.download', name: 'Download Agreements', module: 'Agreements' },

  { key: 'reports.view', name: 'View Reports', module: 'Reports' },
  { key: 'reports.export', name: 'Export/Download Reports', module: 'Reports' },

  { key: 'vendors.view', name: 'View Vendors', module: 'Vendors' },
  { key: 'vendors.update', name: 'Update Vendors', module: 'Vendors' },

  { key: 'sub_vendors.view', name: 'View Sub-Vendors', module: 'Sub-Vendors' },
  { key: 'sub_vendors.update', name: 'Update Sub-Vendors', module: 'Sub-Vendors' },

  { key: 'employees.view', name: 'View Employees', module: 'Employees' },
  { key: 'employees.update', name: 'Update Employees', module: 'Employees' },

  { key: 'members.view', name: 'View Members', module: 'Members' },
  { key: 'members.update', name: 'Update Members', module: 'Members' },

  { key: 'payments.view', name: 'View Payments', module: 'Payments' },
  { key: 'network.view', name: 'View Network Tree', module: 'Network' },
  { key: 'forms.view', name: 'View Dynamic Forms', module: 'Dynamic Forms' },
  { key: 'forms.manage', name: 'Manage Dynamic Forms', module: 'Dynamic Forms' }
];

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // Seed default permissions if they don't exist, and upsert any newly added default permissions
    for (const perm of DEFAULT_PERMISSIONS) {
      await Permission.findOneAndUpdate(
        { key: perm.key },
        { $setOnInsert: perm },
        { upsert: true, new: true }
      );
    }

    const permissions = await Permission.find({}).sort({ module: 1, key: 1 });
    return successResponse(permissions);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { userId, permissions } = await req.json();
    if (!userId || !Array.isArray(permissions)) {
      return errorResponse('Missing userId or permissions array', 400);
    }

    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);
    if (!user || !['operations_admin', 'staff'].includes(user.role)) {
      return errorResponse('Permission enabled user not found', 404);
    }

    user.permissions = permissions;
    await user.save();

    const { logActivity } = await import('@/utils/authHelpers');
    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity('permissions_updated', (session as any).id, user._id, ip, { permissions });

    return successResponse(user, 'Permissions updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
