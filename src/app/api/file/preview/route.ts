import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import dbConnect from '@/lib/mongodb';

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

    await dbConnect();
    const sessionUser = session as any;
    let isAuthorized = false;

    if (sessionUser.role === 'super_admin') {
      isAuthorized = true;
    } else {
      // Find target user from associated collections to verify owner or regional scoping
      const [Document, VendorAgreement, EmployeeOfferLetter, AuthorizationLetter, User, FileRecord] = await Promise.all([
        import('@/models/Document').then(m => m.default),
        import('@/models/VendorAgreement').then(m => m.default),
        import('@/models/EmployeeOfferLetter').then(m => m.default),
        import('@/models/AuthorizationLetter').then(m => m.default),
        import('@/models/User').then(m => m.default),
        import('@/models/FileRecord').then(m => m.default),
      ]);

      let ownerId: string | null = null;
      let targetUser: any = null;

      const fileRecord = await FileRecord.findOne({ url }).lean();
      if (fileRecord && fileRecord.uploadedBy) {
        ownerId = fileRecord.uploadedBy.toString();
      }

      const doc = await Document.findOne({
        $or: [{ fileUrl: url }, { uploadedDocumentUrl: url }]
      }).lean();
      if (doc && !ownerId) {
        ownerId = doc.userId.toString();
      }

      const va = await VendorAgreement.findOne({
        $or: [{ fileUrl: url }, { uploadedDocumentUrl: url }]
      }).lean();
      if (va) {
        if (!ownerId) ownerId = va.vendorId.toString();
      }

      const ol = await EmployeeOfferLetter.findOne({
        $or: [{ pdfUrl: url }, { uploadedDocumentUrl: url }]
      }).lean();
      if (ol) {
        if (!ownerId) ownerId = ol.employeeId.toString();
      }

      const authLetter = await AuthorizationLetter.findOne({ pdfUrl: url }).lean();
      if (authLetter) {
        if (!ownerId) ownerId = authLetter.userId.toString();
      }

      if (!ownerId) {
        const u = await User.findOne({ profileImage: url }).lean();
        if (u) ownerId = u._id.toString();
      }

      if (ownerId) {
        targetUser = await User.findById(ownerId).lean();
      }

      if (ownerId && sessionUser.id === ownerId) {
        isAuthorized = true;
      } else if (['operations_admin', 'staff'].includes(sessionUser.role)) {
        const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');
        
        let requiredPermission = 'documents.view';
        const isOfferLetter = url.toLowerCase().includes('offer-letter') || url.toLowerCase().includes('offer_letter') || !!ol;
        const isAgreement = url.toLowerCase().includes('agreement') || !!va;
        const isAuthLetter = url.toLowerCase().includes('authorization') || !!authLetter;

        if (isOfferLetter) {
          requiredPermission = 'offer_letters.download';
        } else if (isAgreement) {
          requiredPermission = 'agreements.view';
        } else if (isAuthLetter) {
          requiredPermission = 'authorization.view';
        }

        const hasPerm = await hasPermission(sessionUser.id, sessionUser.role, requiredPermission);
        if (hasPerm) {
          if (targetUser) {
            const withinScope = await checkRegionalScope(targetUser, session);
            if (withinScope) {
              isAuthorized = true;
            }
          } else {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient Permissions or Regional Scope Violation' }, { status: 403 });
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
