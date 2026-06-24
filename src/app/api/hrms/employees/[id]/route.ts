import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const sessionUser = session as any;
    // Gate to Admins only
    if (!['super_admin', 'operations_admin'].includes(sessionUser.role)) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const { id } = await params;
    await dbConnect();

    const body = await req.json();
    const {
      isHrmsEnabled,
      department,
      reportingManager,
      employeeType,
      employmentStatus,
      assignedVillages
    } = body;

    const user = await User.findById(id);
    if (!user || !['employee', 'staff'].includes(user.role)) {
      return errorResponse('Employee not found', 404);
    }

    // Capture old values for audit logging
    const oldValues = {
      isHrmsEnabled: user.isHrmsEnabled,
      department: user.department,
      reportingManager: user.reportingManager,
      employeeType: user.employeeType,
      employmentStatus: user.employmentStatus,
      assignedVillages: user.assignedVillages
    };

    // Update values
    if (typeof isHrmsEnabled === 'boolean') user.isHrmsEnabled = isHrmsEnabled;
    if (typeof department === 'string') user.department = department;
    if (reportingManager !== undefined) {
      user.reportingManager = reportingManager ? reportingManager : undefined;
    }
    if (typeof employeeType === 'string') user.employeeType = employeeType;
    if (typeof employmentStatus === 'string') {
      user.employmentStatus = employmentStatus;
      // Optionally align status field
      if (employmentStatus === 'Active') {
        user.status = 'active';
      } else if (employmentStatus === 'Suspended') {
        user.status = 'suspended';
      } else if (employmentStatus === 'Inactive') {
        user.status = 'inactive';
      }
    }
    if (Array.isArray(assignedVillages)) user.assignedVillages = assignedVillages;

    await user.save();

    // Audit logs for HRMS update
    const ipAddress = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    
    if (oldValues.isHrmsEnabled !== user.isHrmsEnabled) {
      await logActivity('HRMS Enabled', sessionUser.id, user._id, ipAddress, {
        previous: oldValues.isHrmsEnabled,
        current: user.isHrmsEnabled
      });
    }
    if (oldValues.department !== user.department) {
      await logActivity('Department Updated', sessionUser.id, user._id, ipAddress, {
        previous: oldValues.department,
        current: user.department
      });
    }
    if (String(oldValues.reportingManager) !== String(user.reportingManager)) {
      await logActivity('Manager Updated', sessionUser.id, user._id, ipAddress, {
        previous: oldValues.reportingManager,
        current: user.reportingManager
      });
    }
    if (JSON.stringify(oldValues.assignedVillages) !== JSON.stringify(user.assignedVillages)) {
      await logActivity('Villages Updated', sessionUser.id, user._id, ipAddress, {
        previous: oldValues.assignedVillages,
        current: user.assignedVillages
      });
    }

    return successResponse(user, 'Employee HRMS configuration updated successfully');
  } catch (error: any) {
    console.error('HRMS Employee Details PATCH Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
