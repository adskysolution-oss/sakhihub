import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VendorAgreement from '@/models/VendorAgreement';
import AgreementAcceptanceLog from '@/models/AgreementAcceptanceLog';
import { getAuthSession } from '@/lib/auth';
import { generateAgreementHtml, generatePdfBuffer } from '@/utils/pdfGenerator';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession() as any;
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accepted, agreementId } = body;

    if (!accepted || !agreementId) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    await dbConnect();

    const agreement = await VendorAgreement.findOne({ 
      vendorId: session.userId, 
      agreementId 
    });

    if (!agreement) {
      return NextResponse.json({ success: false, message: 'Agreement not found' }, { status: 404 });
    }

    if (agreement.status === 'approved') {
      return NextResponse.json({ success: false, message: 'Agreement already accepted' }, { status: 400 });
    }

    // Capture device IP/Info from request
    const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown IP';
    const deviceInfo = request.headers.get('user-agent') || 'Unknown Device';
    const acceptanceTimestamp = new Date();

    // Log acceptance
    await AgreementAcceptanceLog.create({
      agreementId,
      vendorId: session.userId,
      acceptedAt: acceptanceTimestamp,
      ipAddress,
      deviceInfo,
      otpVerified: true, // Assuming front-end handled OTP or we simulate it here
      digitalSignature: `ACCEPTED-${session.userId}-${Date.now()}`
    });

    // Update templateData with acceptance signature details
    const updatedTemplateData = {
      ...(agreement.templateData || {}),
      status: 'approved',
      acceptanceTimestamp: acceptanceTimestamp.toLocaleString('en-IN'),
      ipAddress,
    };

    // Generate Final HTML and PDF
    const htmlContent = generateAgreementHtml(updatedTemplateData);
    const pdfBuffer = await generatePdfBuffer(htmlContent);

    // Convert Buffer to base64 data URI
    const base64Pdf = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;

    // Upload Final Signed PDF to Cloudinary
    const uploadResult = await uploadToCloudinary(base64Pdf, 'vendor_agreements');
    const finalFileUrl = uploadResult.secure_url;

    // Update main agreement status and store the final Cloudinary URL
    agreement.status = 'approved';
    agreement.acceptanceTimestamp = acceptanceTimestamp;
    agreement.templateData = updatedTemplateData;
    agreement.fileUrl = finalFileUrl;
    
    await agreement.save();

    return NextResponse.json({
      success: true,
      message: 'Agreement digitally accepted and finalized successfully',
      data: agreement
    });

  } catch (error: any) {
    console.error('Accept Vendor Agreement Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to accept agreement' }, { status: 500 });
  }
}
