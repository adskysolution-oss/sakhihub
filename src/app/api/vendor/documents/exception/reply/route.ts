import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { type, reply } = await req.json();

    if (!type || !reply) {
      return errorResponse('Missing required fields', 400);
    }

    await dbConnect();
    const user = await User.findById((session as any).id);

    if (!user || !user.documents) {
      return errorResponse('User or documents not found', 404);
    }

    const doc = (user.documents as any)[type];
    if (!doc || doc.status !== 'on_hold') {
      return errorResponse('You can only reply to documents that are on hold', 400);
    }

    // Update document
    const updatedDocuments = { ...(user.documents as any) };
    updatedDocuments[type] = {
      ...doc,
      status: 'exception_responded',
      exceptionUserReply: reply,
      updatedAt: new Date()
    };

    user.documents = updatedDocuments;
    user.markModified('documents');
    await user.save();

    return successResponse(user.documents[type], 'Reply submitted successfully');
  } catch (error: any) {
    console.error('Exception reply error:', error);
    return errorResponse(error.message || 'Failed to submit reply', 500);
  }
}
