import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VendorAgreement from '@/models/VendorAgreement';
import AgreementAcceptanceLog from '@/models/AgreementAcceptanceLog';
import { getAuthSession } from '@/lib/auth';
import { generateAgreementHtml, generatePdfBuffer } from '@/utils/pdfGenerator';
import { uploadBuffer } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession() as any;
    const currentUserId = session?.id || session?.userId;
    if (!session || !currentUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { accepted, agreementId } = body;

    if (!accepted || !agreementId) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    await dbConnect();

    const agreement = await VendorAgreement.findOne({ 
      vendorId: currentUserId, 
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
      vendorId: currentUserId,
      acceptedAt: acceptanceTimestamp,
      ipAddress,
      deviceInfo,
      otpVerified: true, // Assuming front-end handled OTP or we simulate it here
      digitalSignature: `ACCEPTED-${currentUserId}-${Date.now()}`
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

    // Upload Final Signed PDF to unified storage
    const uploadResult = await uploadBuffer(
      Buffer.from(pdfBuffer),
      'application/pdf',
      'vendor_agreements',
      {
        uploadedBy: currentUserId,
        uploadedFor: 'vendorAgreement',
        originalName: `${agreementId}_signed.pdf`
      }
    );
    const finalFileUrl = uploadResult.url;

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
