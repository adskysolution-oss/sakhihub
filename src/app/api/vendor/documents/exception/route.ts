import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';
import { getRequiredDocsForUser } from '@/lib/docs/service';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { type, exceptionReason } = await req.json();

    if (!type || !exceptionReason) {
      return errorResponse('Missing required fields', 400);
    }

    await dbConnect();
    const user = await User.findById((session as any).id);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const allowedTypes = getRequiredDocsForUser(user.role, user.documents, user.vendorType);
    if (!allowedTypes.includes(type)) {
      return errorResponse('Invalid document type for this role', 400);
    }
    
    // Prevent modification of approved documents
    if (user.documents && (user.documents as any)[type]?.status === 'approved') {
      return errorResponse('Document is approved and cannot be modified.', 403);
    }

    const updatedDocuments = { ...(user.documents as any) || {} };
    
    updatedDocuments[type] = {
      ...(updatedDocuments[type] || {}),
      url: '', // Explicitly clear any placeholder/URL
      status: 'exception_requested',
      exceptionReason: exceptionReason,
      uploadedAt: new Date()
    };

    user.documents = updatedDocuments;
    await user.save();

    return successResponse(user.documents[type], 'Exception request submitted successfully');
  } catch (error: any) {
    console.error('Exception submission error:', error);
    return errorResponse(error.message || 'Failed to submit exception request', 500);
  }
}
