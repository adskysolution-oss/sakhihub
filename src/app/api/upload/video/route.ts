import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { uploadBuffer } from '@/lib/storage';
import { successResponse, errorResponse } from '@/utils/response';
import ffmpegPath from 'ffmpeg-static';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const userId = (session as any).id || (session as any).userId;

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const groupId = formData.get('groupId') as string | null;
    const meetingId = formData.get('meetingId') as string | null;
    const durationStr = formData.get('duration') as string | null;

    if (!file) return errorResponse('No video file provided', 400);
    if (!groupId || !meetingId) return errorResponse('Group ID and Meeting ID are required', 400);

    const duration = durationStr ? parseFloat(durationStr) : undefined;

    // Enforce 30MB limit on the uploaded file
    const maxUploadSize = 30 * 1024 * 1024; // 30MB
    if (file.size > maxUploadSize) {
      return errorResponse('Video file exceeds the maximum 30MB size limit', 400);
    }

    // Ensure temp directory exists inside workspace
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Setup input/output temp paths
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const inputExt = path.extname(file.name) || '.mp4';
    const tempInputPath = path.join(tempDir, `input_${uniqueSuffix}${inputExt}`);
    const tempOutputPath = path.join(tempDir, `output_${uniqueSuffix}.mp4`);

    // Convert file stream to buffer and save to temp input
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(tempInputPath, buffer);

    let resolvedFfmpeg = ffmpegPath;
    if (!resolvedFfmpeg || !fs.existsSync(resolvedFfmpeg) || resolvedFfmpeg.includes('ROOT')) {
      const fallbackPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
      if (fs.existsSync(fallbackPath)) {
        resolvedFfmpeg = fallbackPath;
      }
    }

    if (!resolvedFfmpeg || !fs.existsSync(resolvedFfmpeg)) {
      throw new Error(`FFmpeg binary could not be resolved. Resolved path: ${resolvedFfmpeg}`);
    }

    // Execute FFmpeg scaling and compression command
    // -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 28 output.mp4
    const cmd = `"${resolvedFfmpeg}" -i "${tempInputPath}" -vf scale=1280:720 -c:v libx264 -crf 28 -y "${tempOutputPath}"`;
    
    try {
      await execPromise(cmd);
    } catch (ffmpegErr: any) {
      console.error('FFmpeg execution error:', ffmpegErr);
      // Clean up input file if FFmpeg fails
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      return errorResponse('Failed to compress video', 500);
    }

    // Read compressed file into buffer
    if (!fs.existsSync(tempOutputPath)) {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      throw new Error('FFmpeg completed but output file was not found');
    }

    const compressedBuffer = await fs.promises.readFile(tempOutputPath);

    // Upload compressed video buffer to S3 under groups/{groupId}/meetings/{meetingId}/videos/
    const folderPath = `groups/${groupId}/meetings/${meetingId}/videos`;
    const uploadResult = await uploadBuffer(
      compressedBuffer,
      'video/mp4',
      folderPath,
      {
        uploadedBy: userId,
        uploadedFor: `meeting:${meetingId}`,
        originalName: file.name
      }
    );

    // Synchronous clean up of temp files
    try {
      if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    } catch (cleanupErr) {
      console.error('Failed to clean up temp files:', cleanupErr);
    }

    return successResponse({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      size: compressedBuffer.length,
      duration: duration
    }, 'Video compressed and uploaded successfully');

  } catch (error: any) {
    console.error('Video upload API error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
