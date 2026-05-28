import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileUri: string, folder: string, options: any = {}) => {
  try {
    const isPDF = fileUri.startsWith('data:application/pdf');
    
    // For PDFs, we enforce resource_type 'image' to avoid Cloudinary's free tier
    // malware protection blocking delivery of 'raw' files ("Customer is marked as untrusted").
    let finalPublicId = options.public_id;
    if (isPDF && !finalPublicId) {
      finalPublicId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    const uploadOptions = {
      invalidate: true,
      resource_type: "image", // Force image type, which handles PDFs correctly without blocking
      ...(isPDF ? { format: 'pdf', flags: 'attachment:false' } : {}),
      folder: `sakhihub/${folder}`,
      ...(finalPublicId ? { public_id: finalPublicId } : {}),
      ...options
    };

    const result = await cloudinary.uploader.upload(fileUri, uploadOptions);
    
    // Ensure PDFs have the .pdf extension in the URL
    if (isPDF && !result.secure_url.toLowerCase().endsWith('.pdf')) {
      result.secure_url = result.secure_url + '.pdf';
    }
    
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const uploadBufferToCloudinary = async (buffer: Buffer, mimeType: string, folder: string, options: any = {}) => {
  return new Promise<any>((resolve, reject) => {
    const isPDF = mimeType === 'application/pdf';
    const uploadOptions = {
      folder: `sakhihub/${folder}`,
      resource_type: isPDF ? 'image' : 'auto',
      ...options
    };

    if (isPDF) {
      uploadOptions.format = 'pdf';
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error("Cloudinary stream upload error:", error);
        return reject(error);
      }
      resolve(result);
    });

    stream.end(buffer);
  });
};

export default cloudinary;
