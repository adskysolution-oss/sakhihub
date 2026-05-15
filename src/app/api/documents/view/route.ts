import { NextRequest, NextResponse } from 'next/server';

/**
 * PDF Document Proxy
 * Fetches a PDF from Cloudinary and serves it with correct Content-Type headers.
 * This fixes the "Failed to load PDF document" error caused by Cloudinary's
 * raw resource type serving files with application/octet-stream.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ success: false, message: 'URL parameter is required' }, { status: 400 });
  }

  // Security: Only allow Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) {
    return NextResponse.json({ success: false, message: 'Invalid document URL' }, { status: 400 });
  }

  try {
    // With the new upload logic (resource_type: 'image'), Cloudinary natively serves 
    // PDFs with the correct 'application/pdf' Content-Type and allows inline viewing.
    // We can safely redirect the user directly to the Cloudinary URL.
    return NextResponse.redirect(new URL(url));
  } catch (error: any) {
    console.error('Document redirect error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to open document' },
      { status: 500 }
    );
  }
}
