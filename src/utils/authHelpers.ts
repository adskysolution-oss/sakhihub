import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { getAuthSession } from '@/lib/auth';
import { errorResponse } from '@/utils/response';

/**
 * Checks if a user has a specific permission.
 * - 'super_admin' has all permissions.
 * - 'operations_admin' is checked against their permissions list in DB.
 * - Other roles return false.
 */
export async function hasPermission(
  userId: string,
  role: string,
  permissionKey: string
): Promise<boolean> {
  if (role === 'super_admin') return true;
  if (role !== 'operations_admin') return false;

  await dbConnect();
  const user = await User.findById(userId).lean();
  if (!user) return false;

  return Array.isArray(user.permissions) && user.permissions.includes(permissionKey);
}

/**
 * Middleware helper for API routes to gate by permission.
 */
export async function verifyPermission(permissionKey: string): Promise<{
  authorized: boolean;
  error: any;
  session: any;
}> {
  const session = await getAuthSession();
  if (!session) {
    return {
      authorized: false,
      error: errorResponse('Unauthorized', 401),
      session: null
    };
  }

  const sessionUser = session as any;
  const isAuthorized = await hasPermission(sessionUser.id, sessionUser.role, permissionKey);
  if (!isAuthorized) {
    return {
      authorized: false,
      error: errorResponse('Forbidden: Insufficient Permissions', 403),
      session
    };
  }

  return { authorized: true, error: undefined, session };
}

/**
 * Reusable regional filter helper. Adds state/district filters to baseMatch query
 * if operations_admin is set to regional scope.
 */
export async function applyRegionalFilter(baseMatch: any, session: any): Promise<any> {
  if (!session || session.role !== 'operations_admin') return baseMatch;

  await dbConnect();
  const dbUser = await User.findById(session.id).lean();
  if (!dbUser || dbUser.assignedScope !== 'regional') return baseMatch;

  const filters: any[] = [];
  if (Array.isArray(dbUser.assignedStates) && dbUser.assignedStates.length > 0) {
    filters.push({ state: { $in: dbUser.assignedStates } });
  }
  if (Array.isArray(dbUser.assignedDistricts) && dbUser.assignedDistricts.length > 0) {
    filters.push({ district: { $in: dbUser.assignedDistricts } });
  }

  if (filters.length > 0) {
    // Merge filters with an OR condition so they match assigned states OR districts
    if (baseMatch.$and) {
      baseMatch.$and.push({ $or: filters });
    } else {
      baseMatch.$and = [{ $or: filters }];
    }
  }

  return baseMatch;
}

/**
 * System-wide activity logger.
 */
export async function logActivity(
  action: string,
  performedBy: string | mongoose.Types.ObjectId,
  targetUser?: string | mongoose.Types.ObjectId,
  ipAddress?: string,
  details: any = {}
) {
  try {
    await dbConnect();
    const logData: any = {
      action,
      details,
      timestamp: new Date()
    };

    if (performedBy) {
      logData.performedBy = new mongoose.Types.ObjectId(performedBy.toString());
    }
    if (targetUser) {
      logData.targetUser = new mongoose.Types.ObjectId(targetUser.toString());
    }
    if (ipAddress) {
      logData.ipAddress = ipAddress;
    }

    await AuditLog.create(logData);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
