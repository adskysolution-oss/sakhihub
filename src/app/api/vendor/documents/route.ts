import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  REQUIRED_DOCS_BY_ROLE, 
  getDocumentFolderPath 
} from '@/lib/docs/service';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const fileName = formData.get('fileName') as string;
    const fileSize = formData.get('fileSize') as string;
    const mimeType = formData.get('mimeType') as string;

    if (!file || !type) {
      return errorResponse('Missing required fields', 400);
    }

    await dbConnect();
    const user = await User.findById((session as any).id);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const allowedTypes = REQUIRED_DOCS_BY_ROLE[user.role as keyof typeof REQUIRED_DOCS_BY_ROLE] || [];

    if (!allowedTypes.includes(type)) {
      return errorResponse('Invalid document type for this role', 400);
    }

    // Safely generate folder path: sakhihub/[role]s/[email_slug]
    const folder = getDocumentFolderPath(user) || `sakhihub/${user.role}s/${user._id}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    // Structure publicId as: documentType_timestamp (Do not append .pdf here, format will handle it)
    const publicId = `${type}_${Date.now()}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const { v2: cloudinary } = require('cloudinary');
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          public_id: publicId,
          resource_type: 'image', // Must use 'image' for PDFs on free tier to avoid 'Blocked for delivery' error
          format: isPDF ? 'pdf' : undefined, // Tell Cloudinary to explicitly treat it as PDF
          flags: 'attachment:false', // Try to ensure it can be opened inline
          invalidate: true,
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    if (!uploadResult || !uploadResult.secure_url) {
      return errorResponse('Cloudinary upload failed', 500);
    }

    let secureUrl = uploadResult.secure_url;
    if (isPDF && !secureUrl.toLowerCase().endsWith('.pdf')) {
      secureUrl = secureUrl + '.pdf';
    }

    // Initialize documents object if it doesn't exist
    if (!user.documents) {
      user.documents = {};
    }

    user.documents[type] = {
      url: secureUrl,
      publicId: uploadResult.public_id,
      fileName: fileName || file.name || `${type}.pdf`,
      fileSize: fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      mimeType: mimeType || file.type || 'application/pdf',
      status: 'uploaded',
      uploadedAt: new Date(),
    };

    // Update global status if needed (from pending to documents_uploaded)
    const requiredDocs = REQUIRED_DOCS_BY_ROLE[user.role as keyof typeof REQUIRED_DOCS_BY_ROLE] || [];
    const uploadedDocs = Object.keys(user.documents).filter(key => !!user.documents[key].url);
    
    if (user.status === 'pending' && requiredDocs.every(doc => uploadedDocs.includes(doc))) {
      user.status = 'documents_uploaded';
    }

    user.markModified('documents');
    await user.save();

    return successResponse({
      message: 'Document uploaded successfully',
      document: user.documents[type],
      status: user.status
    });

  } catch (error: any) {
    console.error('Upload Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    await dbConnect();
    const user = await User.findById((session as any).id);

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      documents: user.documents || {},
      status: user.status
    });

  } catch (error: any) {
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
