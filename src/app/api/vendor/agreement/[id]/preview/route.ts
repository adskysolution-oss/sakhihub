import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VendorAgreement from '@/models/VendorAgreement';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { generateAgreementHtml, generatePdfBuffer } from '@/utils/pdfGenerator';

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id: agreementId } = await params;

    await dbConnect();

    // Check if the parameter matches the final PDF URL first, just in case
    const agreement = await VendorAgreement.findOne({ agreementId });

    if (!agreement) {
      return NextResponse.json({ success: false, message: 'Agreement not found' }, { status: 404 });
    }

    // Security check: Only super_admin, authorized admin, or the specific vendor can view
    const currentUserId = session.id || session.userId;
    const { hasPermission } = await import('@/utils/authHelpers');
    const isAuthorized = session.role === 'super_admin' || 
      session.role === 'admin' ||
      await hasPermission(currentUserId, session.role, 'agreements.view') ||
      currentUserId === agreement.vendorId.toString();

    if (!isAuthorized) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const regenerate = request.nextUrl.searchParams.get('regenerate') === 'true';

    // If it's already approved and has a real fileUrl (from Cloudinary), redirect to it (only in production)
    if (process.env.NODE_ENV === 'production' && !regenerate && agreement.status === 'approved' && agreement.fileUrl && agreement.fileUrl.startsWith('http')) {
      return NextResponse.redirect(agreement.fileUrl);
    }

    // If templateData is not available, construct it from the generated agreement snapshot
    let templateData = agreement.templateData || {};

    // Always fetch latest vendor details to populate mobile and email dynamically
    const user = await User.findById(agreement.vendorId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Vendor details not found for preview' }, { status: 404 });
    }

    templateData = {
      ...templateData,
      mobile: user.mobile || templateData.mobile || '',
      email: user.email || templateData.email || '',
      address: user.address || templateData.address || '',
      district: user.district || templateData.district || '',
      state: user.state || templateData.state || '',
      vendorName: user.fullName || templateData.vendorName || '',
      vendorCode: agreement.vendorCode || user.vendorCode || user.subVendorCode || templateData.vendorCode || 'PENDING',
      role: user.role || templateData.role || 'vendor',
      joiningDate: templateData.joiningDate || new Date(agreement.joiningDate).toLocaleDateString('en-IN'),
      agreementId: agreement.agreementId,
      qrVerificationCode: agreement.qrVerificationCode,
      status: agreement.status
    };

    const htmlContent = generateAgreementHtml(templateData);
    const pdfBuffer = await generatePdfBuffer(htmlContent, templateData.agreementId);

    // If we are regenerating an approved agreement, upload it back to Cloudinary
    if (regenerate && agreement.status === 'approved') {
      try {
        const { uploadBuffer } = await import('@/lib/storage');
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
        agreement.fileUrl = uploadResult.url;
        agreement.templateData = templateData;
        await agreement.save();
      } catch (uploadError) {
        console.error('Failed to upload regenerated agreement to Cloudinary:', uploadError);
      }
    }

    // Return the PDF directly
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${agreementId}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Preview Agreement Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message || String(error),
      stack: error.stack
    }, { status: 500 });
  }
}
