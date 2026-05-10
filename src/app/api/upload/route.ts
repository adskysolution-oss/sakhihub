import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { image, folder = 'general' } = body;

    if (!image) return errorResponse('No image provided', 400);

    const uploadResult = await uploadToCloudinary(image, folder);

    return successResponse({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes
    }, 'Upload successful');
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return errorResponse(error.message || "Upload failed", 500);
  }
}
