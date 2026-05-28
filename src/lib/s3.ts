import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToS3 = async (fileUri: string, folder: string, options: any = {}) => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) throw new Error("AWS_S3_BUCKET_NAME is not configured");

    // fileUri is expected to be a base64 string, e.g., "data:image/png;base64,iVBORw0KGgo..."
    const match = fileUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid file format. Expected base64 data URI.');
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    return await uploadBufferToS3(buffer, mimeType, folder, options);
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
};

export const uploadBufferToS3 = async (buffer: Buffer, mimeType: string, folder: string, options: any = {}) => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) throw new Error("AWS_S3_BUCKET_NAME is not configured");

    // Extract extension from mimeType
    const ext = mimeType.split('/')[1]?.split('+')[0] || 'bin';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    
    // Maintain sakhihub prefix just like Cloudinary without duplicating it
    const cleanFolder = folder.startsWith('sakhihub/') ? folder : `sakhihub/${folder}`;
    let objectKey = `${cleanFolder}/${timestamp}_${randomStr}.${ext}`;
    
    // If public_id is provided in options, use it
    if (options.public_id) {
        objectKey = `${cleanFolder}/${options.public_id}.${ext}`;
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: mimeType,
      ...options.s3Options // any explicit S3 options
    });

    await s3Client.send(command);

    const secureUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${objectKey}`;

    return {
      secure_url: secureUrl,
      public_id: objectKey, // Key used in S3
      format: ext,
      bytes: buffer.length,
      mimeType: mimeType
    };
  } catch (error) {
    console.error("S3 buffer upload error:", error);
    throw error;
  }
};

export default s3Client;
