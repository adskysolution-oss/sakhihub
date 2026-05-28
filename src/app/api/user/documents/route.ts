import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadBuffer } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const documents = await Document.find({ userId: (session as any).id });
    return successResponse(documents);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;

    if (!file || !type || !title) {
      return errorResponse('Missing file, type, or title', 400);
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to unified storage
    const uploadResult = await uploadBuffer(
      buffer,
      file.type,
      'documents',
      {
        uploadedBy: (session as any).id,
        uploadedFor: 'userDocument',
        originalName: file.name
      }
    );

    await dbConnect();
    const document = await Document.create({
      userId: (session as any).id,
      type,
      title,
      fileUrl: uploadResult.url,
      status: 'pending'
    });

    return successResponse(document, 'Document uploaded successfully', 201);
  } catch (error: any) {
    console.error('Document Upload Error:', error);
    return errorResponse(error.message, 500);
  }
}
