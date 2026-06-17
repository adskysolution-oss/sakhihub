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
  if (!['operations_admin', 'staff'].includes(role)) return false;

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
import { NextResponse } from 'next/server';

/**
 * Reusable regional filter helper. Adds state/district/block filters to baseMatch query
 * if operations_admin or staff is set to regional/state/district/block scope.
 */
export async function applyRegionalFilter(baseMatch: any, session: any): Promise<any> {
  if (!session || !['operations_admin', 'staff'].includes(session.role)) return baseMatch;

  await dbConnect();
  const dbUser = await User.findById(session.id).lean() as any;
  if (!dbUser || ['all', 'all_india'].includes(dbUser.assignedScope || 'all')) return baseMatch;

  const filters: any[] = [];
  if (Array.isArray(dbUser.assignedStates) && dbUser.assignedStates.length > 0) {
    filters.push({ state: { $in: dbUser.assignedStates } });
  }
  if (Array.isArray(dbUser.assignedDistricts) && dbUser.assignedDistricts.length > 0) {
    filters.push({ district: { $in: dbUser.assignedDistricts } });
  }
  if (Array.isArray(dbUser.assignedBlocks) && dbUser.assignedBlocks.length > 0) {
    filters.push({ block: { $in: dbUser.assignedBlocks } });
  }

  if (filters.length > 0) {
    // Merge filters with an OR condition so they match assigned states OR districts OR blocks
    if (baseMatch.$and) {
      baseMatch.$and.push({ $or: filters });
    } else {
      baseMatch.$and = [{ $or: filters }];
    }
  }

  return baseMatch;
}

/**
 * Centrally gates endpoint execution by permission.
 */
export async function requirePermission(permissionKey: string): Promise<{
  authorized: boolean;
  response?: NextResponse;
  session?: any;
}> {
  const { authorized, error, session } = await verifyPermission(permissionKey);
  if (!authorized) {
    return {
      authorized: false,
      response: error as NextResponse
    };
  }
  return { authorized: true, session };
}

/**
 * Check if a target record/user lies within the administrator's regional boundaries.
 */
export async function checkRegionalScope(target: any, session: any): Promise<boolean> {
  if (!session) return false;
  if (session.role === 'super_admin') return true;
  if (!['operations_admin', 'staff'].includes(session.role)) return false;

  await dbConnect();
  const dbUser = await User.findById(session.id).lean() as any;
  if (!dbUser || ['all', 'all_india'].includes(dbUser.assignedScope || 'all')) return true;

  if (!target) return false;

  // Resolve target if it doesn't have location fields directly but has user references
  const hasState = typeof target.state === 'string' && target.state.trim() !== '';
  const hasDistrict = typeof target.district === 'string' && target.district.trim() !== '';
  const hasBlock = typeof target.block === 'string' && target.block.trim() !== '';

  if (!hasState && !hasDistrict && !hasBlock) {
    const userIdToCheck = target.userId || target.vendorId || target.employeeId;
    if (userIdToCheck) {
      const resolvedUser = await User.findById(userIdToCheck).lean();
      if (resolvedUser) {
        return checkRegionalScope(resolvedUser, session);
      }
    }
    return false;
  }

  // Check state match
  if (Array.isArray(dbUser.assignedStates) && dbUser.assignedStates.length > 0 && target.state) {
    if (dbUser.assignedStates.includes(target.state)) return true;
  }

  // Check district match
  if (Array.isArray(dbUser.assignedDistricts) && dbUser.assignedDistricts.length > 0 && target.district) {
    if (dbUser.assignedDistricts.includes(target.district)) return true;
  }

  // Check block match
  if (Array.isArray(dbUser.assignedBlocks) && dbUser.assignedBlocks.length > 0 && target.block) {
    if (dbUser.assignedBlocks.includes(target.block)) return true;
  }

  return false;
}

/**
 * Fetches all User IDs within the administrator's scoped territory.
 * Returns null if the administrator has unrestricted scope.
 */
export async function getRegionalUserIds(session: any): Promise<any[] | null> {
  if (!session || !['operations_admin', 'staff'].includes(session.role)) return null;

  await dbConnect();
  const dbUser = await User.findById(session.id).lean() as any;
  if (!dbUser || ['all', 'all_india'].includes(dbUser.assignedScope || 'all')) return null;

  const filters: any[] = [];
  if (Array.isArray(dbUser.assignedStates) && dbUser.assignedStates.length > 0) {
    filters.push({ state: { $in: dbUser.assignedStates } });
  }
  if (Array.isArray(dbUser.assignedDistricts) && dbUser.assignedDistricts.length > 0) {
    filters.push({ district: { $in: dbUser.assignedDistricts } });
  }
  if (Array.isArray(dbUser.assignedBlocks) && dbUser.assignedBlocks.length > 0) {
    filters.push({ block: { $in: dbUser.assignedBlocks } });
  }

  if (filters.length === 0) return [];

  const users = await User.find({ $or: filters }, '_id').lean();
  return users.map(u => u._id);
}

/**
 * Fetches all WomenMember IDs within the administrator's scoped territory.
 * Returns null if the administrator has unrestricted scope.
 */
export async function getRegionalMemberIds(session: any): Promise<any[] | null> {
  if (!session || !['operations_admin', 'staff'].includes(session.role)) return null;

  await dbConnect();
  const dbUser = await User.findById(session.id).lean() as any;
  if (!dbUser || ['all', 'all_india'].includes(dbUser.assignedScope || 'all')) return null;

  const filters: any[] = [];
  if (Array.isArray(dbUser.assignedStates) && dbUser.assignedStates.length > 0) {
    filters.push({ state: { $in: dbUser.assignedStates } });
  }
  if (Array.isArray(dbUser.assignedDistricts) && dbUser.assignedDistricts.length > 0) {
    filters.push({ district: { $in: dbUser.assignedDistricts } });
  }
  if (Array.isArray(dbUser.assignedBlocks) && dbUser.assignedBlocks.length > 0) {
    filters.push({ block: { $in: dbUser.assignedBlocks } });
  }

  if (filters.length === 0) return [];

  const WomenMember = (await import('@/models/WomenMember')).default;
  const members = await WomenMember.find({ $or: filters }, '_id').lean();
  return members.map(m => m._id);
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
