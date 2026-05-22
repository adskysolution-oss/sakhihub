import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import Document from '@/models/Document';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string, docId: string }> }
) {
  try {
    const { id, docId } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 401);
    }

    const { isLocked, isApproved } = await req.json();

    await dbConnect();

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify document exists
    const doc = await Document.findOne({ _id: docId, userId: id });
    if (!doc) {
      return errorResponse('Document not found', 404);
    }

    if (isLocked !== undefined) doc.isLocked = isLocked;
    if (isApproved !== undefined) doc.isApproved = isApproved;
    
    if (isLocked && isApproved) {
        doc.status = 'approved';
    } else if (!isLocked) {
        doc.status = 'unlocked';
    }

    await doc.save();

    return successResponse({
      message: `Document ${isLocked ? 'locked' : 'unlocked'} successfully`,
      document: doc
    });

  } catch (error: any) {
    console.error('Lock/Unlock Document Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
