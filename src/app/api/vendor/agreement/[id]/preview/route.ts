import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VendorAgreement from '@/models/VendorAgreement';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { generateAgreementHtml, generatePdfBuffer } from '@/utils/pdfGenerator';

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

    // Security check: Only admins or the specific vendor can view
    const currentUserId = session.id || session.userId;
    if (session.role !== 'admin' && session.role !== 'super_admin' && currentUserId !== agreement.vendorId.toString()) {
        return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // If it's already approved and has a real fileUrl (from Cloudinary), redirect to it
    if (agreement.status === 'approved' && agreement.fileUrl && agreement.fileUrl.startsWith('http')) {
        return NextResponse.redirect(agreement.fileUrl);
    }

    // If templateData is not available, construct it from the generated agreement snapshot
    let templateData = agreement.templateData;
    
    if (!templateData) {
        const user = await User.findById(agreement.vendorId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Vendor details not found for preview' }, { status: 404 });
        }

        templateData = {
          agreementId: agreement.agreementId,
          vendorName: user.fullName,
          vendorCode: agreement.vendorCode || user.vendorCode || user.subVendorCode || 'PENDING',
          address: user.address || '',
          district: user.district || '',
          state: user.state || '',
          joiningDate: new Date(agreement.joiningDate).toLocaleDateString('en-IN'),
          assignedTerritory: agreement.assignedTerritory,
          incentiveStructure: agreement.incentiveStructure,
          salaryStructure: agreement.salaryStructure,
          monthlyTargets: agreement.monthlyTargets,
          operationalRole: agreement.operationalRole,
          membershipCommission: agreement.membershipCommission,
          partnerType: agreement.partnerType,
          qrVerificationCode: agreement.qrVerificationCode,
          status: agreement.status
        };
    }

    const htmlContent = generateAgreementHtml(templateData);
    const pdfBuffer = await generatePdfBuffer(htmlContent);

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
    return NextResponse.json({ success: false, message: 'Failed to generate preview' }, { status: 500 });
  }
}
