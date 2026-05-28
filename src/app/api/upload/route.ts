import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { image, folder = 'general', uploadedFor, originalName } = body;

    if (!image) return errorResponse('No image provided', 400);

    const uploadResult = await uploadFile(image, folder, {
      uploadedBy: session.user.id,
      uploadedFor,
      originalName
    });

    return successResponse({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      provider: uploadResult.provider
    }, 'Upload successful');
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return errorResponse(error.message || "Upload failed", 500);
  }
}
