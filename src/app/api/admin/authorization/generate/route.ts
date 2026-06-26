import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import AuthorizationLetterAudit from '@/models/AuthorizationLetterAudit';
import { requirePermission } from '@/utils/authHelpers';
import { generateAuthorizationLetterHtml } from '@/utils/authorizationLetterGenerator';
import { generatePdfBuffer } from '@/utils/pdfGenerator';
import { uploadBuffer } from '@/lib/storage';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { authorized, response: authResponse, session } = await requirePermission('authorization.generate');
    if (!authorized) return authResponse;

    const body = await request.json();
    const { userId, validUntil } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Employee not found' }, { status: 404 });
    }

    // 1. Designation Validation
    const designation = user.designation;
    const isDCDesignation = designation === 'District Coordinator' || designation === 'District Project Officer';
    const isBCDesignation = designation === 'Block Coordinator' || designation === 'Field Executive';

    if (!isDCDesignation && !isBCDesignation) {
      return NextResponse.json({
        success: false,
        message: 'Authorization letters are only available for District Coordinators, District Project Officers, Block Coordinators, and Field Executives.'
      }, { status: 400 });
    }

    // 2. Assignment Validation
    if (!user.state || user.state.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'State assignment is missing. Please configure State assignment before generating Authorization Letter.'
      }, { status: 400 });
    }

    if (!user.district || user.district.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'District assignment is missing. Please configure District assignment before generating Authorization Letter.'
      }, { status: 400 });
    }

    if (isBCDesignation && (!user.block || user.block.trim() === '')) {
      return NextResponse.json({
        success: false,
        message: 'Block assignment is missing. Please configure Block assignment before generating Authorization Letter.'
      }, { status: 400 });
    }

    // 3. Eligibility Checks
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: 'Employee status must be Active to generate an Authorization Letter.'
      }, { status: 400 });
    }

    if (user.dashboardAccess !== true) {
      return NextResponse.json({
        success: false,
        message: 'Employee dashboard access must be enabled to generate an Authorization Letter.'
      }, { status: 400 });
    }

    const offerLetter = await EmployeeOfferLetter.findOne({ employeeId: user._id });
    if (!offerLetter) {
      return NextResponse.json({
        success: false,
        message: 'Employee Offer Letter must be generated before generating an Authorization Letter.'
      }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 4. One Active Authorization Letter Rule (Auto-Revoke Previous)
    const existingActiveLetter = await AuthorizationLetter.findOne({ userId: user._id, status: 'active' });
    if (existingActiveLetter) {
      existingActiveLetter.status = 'revoked';
      await existingActiveLetter.save();

      // Log previous revocation in audit trail
      await AuthorizationLetterAudit.create({
        authorizationLetterId: existingActiveLetter._id,
        action: 'revoke',
        performedBy: session.id,
        ipAddress,
        details: {
          reason: 'Superceded by regeneration (new authorization letter generation)'
        }
      });
    }

    // 5. Generate unique sequence number
    const currentYear = new Date().getFullYear();
    const typePrefix = isDCDesignation ? 'DC' : 'BC';
    const prefix = `SH-${typePrefix}-${currentYear}-`;

    const lastLetter = await AuthorizationLetter.findOne({
      authorizationNumber: new RegExp('^' + prefix)
    }).sort({ authorizationNumber: -1 });

    let nextNum = 1;
    if (lastLetter) {
      const parts = lastLetter.authorizationNumber.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const authorizationNumber = `${prefix}${String(nextNum).padStart(6, '0')}`;

    // 6. Create Initial Record in DB to obtain ID
    const issueDate = new Date();
    const validUntilDate = validUntil ? new Date(validUntil) : new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default

    const newLetter = new AuthorizationLetter({
      userId: user._id,
      authorizationNumber,
      authorizationType: isDCDesignation ? 'district_coordinator' : 'block_coordinator',
      state: user.state,
      district: user.district,
      block: isDCDesignation ? undefined : (user.block || undefined),
      issueDate,
      validUntil: validUntilDate,
      generatedBy: session.id,
      pdfUrl: 'PENDING_UPLOAD',
      status: 'active'
    });

    await newLetter.save();

    // 7. Generate PDF HTML & Buffer
    const verificationUrl = `https://sakhihub.com/verify/authorization/${newLetter._id}`;
    const htmlContent = generateAuthorizationLetterHtml({
      employeeName: user.fullName,
      employeeId: user.employeeId || 'PENDING',
      designation,
      state: user.state,
      district: user.district,
      block: isDCDesignation ? undefined : (user.block || undefined),
      authorizationNumber,
      issueDate,
      validUntil: validUntilDate,
      verificationUrl
    });

    // 8. Update PDF URL and finalize letter status (dynamic route preview, no static upload)
    newLetter.pdfUrl = `/employee-authorization-letter/${user._id}`;
    await newLetter.save();

    // 10. Write to Audit Trail
    await AuthorizationLetterAudit.create({
      authorizationLetterId: newLetter._id,
      action: 'generate',
      performedBy: session.id,
      ipAddress,
      details: {
        authorizationNumber,
        validUntil: validUntilDate
      }
    });

    // Populate generatedBy details for return payload
    const populatedLetter = await AuthorizationLetter.findById(newLetter._id)
      .populate('generatedBy', 'fullName role')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Authorization Letter generated successfully',
      data: populatedLetter
    });

  } catch (error: any) {
    console.error('Generate Authorization Letter Error:', error);
    return NextResponse.json({
      success: false,
      message: `Failed to generate authorization letter: ${error.message || error}`
    }, { status: 500 });
  }
}
