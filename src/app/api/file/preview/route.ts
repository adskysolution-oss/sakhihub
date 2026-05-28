import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ success: false, message: 'No URL provided' }, { status: 400 });
    }

    // If it's a Cloudinary URL, just redirect to it
    if (url.includes('res.cloudinary.com')) {
      return NextResponse.redirect(url);
    }

    // If it's an S3 URL, generate a signed URL and redirect to it
    if (url.includes('amazonaws.com')) {
      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      if (!bucketName) {
        return NextResponse.json({ success: false, message: 'AWS S3 is not configured' }, { status: 500 });
      }

      // Extract the key from the URL
      // https://sakhihub-storage.s3.ap-south-1.amazonaws.com/sakhihub/vendor/kajalmanishwedding_gmail_com/documents/1779956645924_23v1cl.jpeg
      const urlParts = url.split('.amazonaws.com/');
      if (urlParts.length < 2) {
        return NextResponse.json({ success: false, message: 'Invalid S3 URL format' }, { status: 400 });
      }

      const objectKey = decodeURIComponent(urlParts[1]);

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      // Generate a signed URL that expires in 15 minutes (900 seconds)
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

      return NextResponse.redirect(signedUrl);
    }

    return NextResponse.json({ success: false, message: 'Unsupported document source' }, { status: 400 });

  } catch (error: any) {
    console.error('Preview URL Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate preview URL' }, { status: 500 });
  }
}
