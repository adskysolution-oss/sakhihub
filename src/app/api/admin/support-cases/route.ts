import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import SupportCase from '@/models/SupportCase';
import Counter from '@/models/Counter';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission, getRegionalUserIds } = await import('@/utils/authHelpers');

    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await hasPermission(currentUserId, (session as any).role, 'support.view') ||
      await hasPermission(currentUserId, (session as any).role, 'support.view_case');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const { searchParams } = new URL(req.url);
    
    await dbConnect();

    // Utility: Fetch eligible assignees list
    if (searchParams.get('getAssignees') === 'true') {
      const admins = await User.find({ role: { $in: ['super_admin', 'operations_admin', 'staff'] } })
        .select('fullName role')
        .sort({ fullName: 1 })
        .lean();
      return successResponse(admins, 'Assignees fetched successfully');
    }

    const userIdParam = searchParams.get('userId');
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');

    const query: any = {};

    // Filter by specific user (History view)
    if (userIdParam) {
      query.user = userIdParam;
    }

    // Filter by status
    if (statusParam && statusParam !== 'all') {
      query.status = statusParam;
    }

    // Filter by search keyword
    if (searchParam && searchParam.trim() !== '') {
      const escapedSearch = searchParam.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { caseId: searchRegex },
        { subject: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    // Enforce regional scoping for operations admins and staff
    const allowedUserIds = await getRegionalUserIds(session);
    if (allowedUserIds !== null) {
      if (query.user) {
        // If query.user is specified, check if it's within their regional list
        const isAllowed = allowedUserIds.some(id => id.toString() === query.user.toString());
        if (!isAllowed) {
          return successResponse([], 'User is out of regional scope');
        }
      } else {
        query.user = { $in: allowedUserIds };
      }
    }

    const cases = await SupportCase.find(query)
      .populate('user', 'fullName mobile email role status profileImage createdAt state district')
      .populate('resolvedBy', 'fullName')
      .populate('assignedTo', 'fullName role')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(cases, 'Support cases fetched successfully');
  } catch (error: any) {
    console.error('Fetch Support Cases Error:', error);
    return errorResponse(error.message || 'Failed to fetch support cases', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission, checkRegionalScope, logActivity } = await import('@/utils/authHelpers');

    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await hasPermission(currentUserId, (session as any).role, 'support.create_case');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const body = await req.json();
    const { userId, category, subCategory, subject, description, priority, attachment, assignedTo } = body;

    if (!userId || !category || !subject || !description) {
      return errorResponse('Missing required fields', 400);
    }

    await dbConnect();

    // Verify regional scope of the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    const withinScope = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await checkRegionalScope(targetUser, session);

    if (!withinScope) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    // Atomic, concurrency-safe Case ID generation
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'SupportCaseCaseId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const caseId = `SUP-${String(counter.seq).padStart(6, '0')}`;

    const newCase = await SupportCase.create({
      caseId,
      user: userId,
      category,
      subCategory,
      subject,
      description,
      priority: priority || 'medium',
      attachment,
      assignedTo: assignedTo || undefined,
      createdBy: currentUserId,
      status: 'open'
    });

    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity(
      'support_case_created',
      currentUserId,
      userId,
      ip,
      { caseId: newCase._id, customCaseId: caseId, subject }
    );

    return successResponse(newCase, 'Support case created successfully');
  } catch (error: any) {
    console.error('Create Support Case Error:', error);
    return errorResponse(error.message || 'Failed to create support case', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission, checkRegionalScope, logActivity } = await import('@/utils/authHelpers');

    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await hasPermission(currentUserId, (session as any).role, 'support.update_case');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const body = await req.json();
    const { id, status, assignedTo, priority, category, resolutionType, resolutionRemarks } = body;

    if (!id) {
      return errorResponse('Case ID is required', 400);
    }

    await dbConnect();

    const caseRecord = await SupportCase.findById(id);
    if (!caseRecord) {
      return errorResponse('Support case not found', 404);
    }

    // Verify regional scope of the case user
    const targetUser = await User.findById(caseRecord.user);
    const withinScope = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await checkRegionalScope(targetUser, session);

    if (!withinScope) {
      return errorResponse('Forbidden: Support case user is out of regional scope', 403);
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo || null;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (resolutionRemarks !== undefined) updates.resolutionRemarks = resolutionRemarks;
    if (resolutionType !== undefined) updates.resolutionType = resolutionType;

    // Handle resolution details if resolving/closing
    if (['resolved', 'closed'].includes(status)) {
      updates.resolvedBy = currentUserId;
      updates.resolvedAt = new Date();
    }

    const updatedCase = await SupportCase.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('user', 'fullName mobile email role status profileImage createdAt state district')
      .populate('resolvedBy', 'fullName')
      .populate('assignedTo', 'fullName role')
      .populate('createdBy', 'fullName');

    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity(
      'support_case_updated',
      currentUserId,
      caseRecord.user,
      ip,
      { caseId: id, status, resolutionRemarks }
    );

    return successResponse(updatedCase, 'Support case updated successfully');
  } catch (error: any) {
    console.error('Update Support Case Error:', error);
    return errorResponse(error.message || 'Failed to update support case', 500);
  }
}
