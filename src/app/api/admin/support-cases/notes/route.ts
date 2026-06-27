import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import EntityNote from '@/models/EntityNote';
import SupportCase from '@/models/SupportCase';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');

    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await hasPermission(currentUserId, (session as any).role, 'support.view') ||
      await hasPermission(currentUserId, (session as any).role, 'support.view_case');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return errorResponse('Case ID is required', 400);
    }

    await dbConnect();

    // Verify regional scope on the case's user
    const caseRecord = await SupportCase.findById(caseId);
    if (!caseRecord) {
      return errorResponse('Support case not found', 404);
    }

    const targetUser = await User.findById(caseRecord.user);
    const withinScope = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await checkRegionalScope(targetUser, session);

    if (!withinScope) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    const notes = await EntityNote.find({
      entityType: 'SupportCase',
      entityId: caseId
    })
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(notes, 'Notes fetched successfully');
  } catch (error: any) {
    console.error('Fetch Internal Notes Error:', error);
    return errorResponse(error.message || 'Failed to fetch internal notes', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const currentUserId = (session as any).id || (session as any).userId;
    const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');

    const isAuthorized = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await hasPermission(currentUserId, (session as any).role, 'support.view') ||
      await hasPermission(currentUserId, (session as any).role, 'support.create_case') ||
      await hasPermission(currentUserId, (session as any).role, 'support.update_case');

    if (!isAuthorized) {
      return errorResponse('Forbidden: Insufficient Permissions', 403);
    }

    const body = await req.json();
    const { caseId, note } = body;

    if (!caseId || !note || note.trim() === '') {
      return errorResponse('Case ID and note text are required', 400);
    }

    await dbConnect();

    // Verify regional scope on the case's user
    const caseRecord = await SupportCase.findById(caseId);
    if (!caseRecord) {
      return errorResponse('Support case not found', 404);
    }

    const targetUser = await User.findById(caseRecord.user);
    const withinScope = (session as any).role === 'super_admin' ||
      (session as any).role === 'admin' ||
      await checkRegionalScope(targetUser, session);

    if (!withinScope) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    const newNote = await EntityNote.create({
      entityType: 'SupportCase',
      entityId: caseId,
      note: note.trim(),
      createdBy: currentUserId
    });

    const populatedNote = await EntityNote.findById(newNote._id).populate('createdBy', 'fullName');

    return successResponse(populatedNote, 'Internal note added successfully');
  } catch (error: any) {
    console.error('Create Internal Note Error:', error);
    return errorResponse(error.message || 'Failed to add internal note', 500);
  }
}
