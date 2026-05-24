import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import VendorAgreement from '@/models/VendorAgreement';
import AgreementVersion from '@/models/AgreementVersion';
import { getAuthSession } from '@/lib/auth';
// Removed PDF generation and Cloudinary upload imports

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && session.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      joiningDate,
      assignedTerritory,
      incentiveStructure,
      salaryStructure,
      monthlyTargets,
      operationalRole,
      membershipCommission,
      partnerType
    } = body;

    if (!joiningDate) {
      return NextResponse.json({ success: false, message: 'Joining date is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Determine current version to assign new version number
    const existingAgreement = await VendorAgreement.findOne({ vendorId: user._id });
    const versionNumber = existingAgreement ? (await AgreementVersion.countDocuments({ vendorId: user._id })) + 1 : 1;

    // Generate Agreement ID and QR Code payload
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const agreementId = existingAgreement?.agreementId || `SH-VAGR-${randomStr}`;
    const qrVerificationCode = `VERIFY-${agreementId}-${versionNumber}`;

    // Prepare template data
    const templateData = {
      agreementId,
      vendorName: user.fullName,
      vendorCode: user.vendorCode || user.subVendorCode || 'PENDING',
      address: user.address || '',
      district: user.district || '',
      state: user.state || '',
      joiningDate: new Date(joiningDate).toLocaleDateString('en-IN'),
      assignedTerritory,
      incentiveStructure,
      salaryStructure,
      monthlyTargets,
      operationalRole,
      membershipCommission,
      partnerType,
      qrVerificationCode,
      status: 'generated'
    };

    // fileUrl points to dynamic preview endpoint for drafts
    const dynamicPreviewUrl = `/api/vendor/agreement/${agreementId}/preview`;

    // Update VendorAgreement Model
    const vendorAgreementDetails = {
      vendorId: user._id,
      vendorCode: templateData.vendorCode,
      partnerType,
      joiningDate: new Date(joiningDate),
      assignedTerritory,
      incentiveStructure,
      salaryStructure,
      monthlyTargets,
      operationalRole,
      membershipCommission,
      generatedDate: new Date(),
      agreementId,
      status: 'generated',
      isLocked: false, // Unlocked on generation so vendor can upload signed copy
      qrVerificationCode,
      fileUrl: dynamicPreviewUrl,
      templateData
    };

    const updatedAgreement = await VendorAgreement.findOneAndUpdate(
      { vendorId: user._id },
      vendorAgreementDetails,
      { upsert: true, returnDocument: 'after' }
    );

    // Create AgreementVersion Record
    await AgreementVersion.create({
      vendorId: user._id,
      agreementId,
      versionNumber,
      fileUrl: dynamicPreviewUrl,
      metadata: templateData
    });

    // We also might want to update the User document to have reference to this agreement if needed, 
    // but the DB schema keeps it separated. We return the updated user payload to refresh frontend.
    const updatedUser = await User.findById(id).populate('assignedCampaigns').lean();

    // Attach the agreement for the frontend
    const userToReturn = {
      ...updatedUser,
      vendorAgreementDetails: updatedAgreement
    };

    return NextResponse.json({
      success: true,
      message: 'Vendor Agreement generated successfully',
      data: userToReturn
    });

  } catch (error: any) {
    console.error('Generate Vendor Agreement Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate vendor agreement' }, { status: 500 });
  }
}
