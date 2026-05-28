import { uploadToCloudinary } from './cloudinary';
import { uploadToS3 } from './s3';
import connectDB from './mongodb';
import FileRecord from '@/models/FileRecord';
import mongoose from 'mongoose';

export type StorageProvider = 's3' | 'cloudinary';

export interface UploadOptions {
  provider?: StorageProvider;
  public_id?: string;
  uploadedBy?: string | mongoose.Types.ObjectId;
  uploadedFor?: string;
  originalName?: string;
  [key: string]: any;
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  provider: StorageProvider;
  fileRecordId?: string;
}

/**
 * Unified storage upload function.
 * Defaults to AWS S3 for all new uploads to preserve the hybrid structure.
 */
export const uploadFile = async (
  fileUri: string,
  folder: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  const { 
    provider = 's3', // Default to S3 for all new uploads 
    uploadedBy,
    uploadedFor,
    originalName,
    ...providerOptions 
  } = options;

  let result;
  let fileType = 'unknown';

  // Try to extract mime type from data URI
  const match = fileUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (match) {
    fileType = match[1];
  }

  // Upload to the selected provider
  if (provider === 's3') {
    const s3Result = await uploadToS3(fileUri, folder, providerOptions);
    result = {
      url: s3Result.secure_url,
      publicId: s3Result.public_id,
      format: s3Result.format,
      bytes: s3Result.bytes,
      provider: 's3' as StorageProvider
    };
  } else {
    // Cloudinary fallback for specific legacy reasons
    const cloudResult = await uploadToCloudinary(fileUri, folder, providerOptions);
    result = {
      url: cloudResult.secure_url,
      publicId: cloudResult.public_id,
      format: cloudResult.format,
      bytes: cloudResult.bytes,
      provider: 'cloudinary' as StorageProvider
    };
  }

  // Record the upload centrally in FileRecord MongoDB collection
  try {
    await connectDB();
    const newRecord = await FileRecord.create({
      url: result.url,
      provider: result.provider,
      key: result.publicId,
      folder,
      uploadedBy,
      uploadedFor,
      fileType,
      fileSize: result.bytes,
      originalName
    });

    result.fileRecordId = newRecord._id.toString();
  } catch (err) {
    // We do not throw if MongoDB tracking fails, but we log the error.
    // This ensures the upload itself doesn't crash if the metadata collection fails for some reason.
    console.error("Failed to save FileRecord metadata:", err);
  }

  return result;
};
