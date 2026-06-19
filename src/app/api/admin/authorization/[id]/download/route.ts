import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import AuthorizationLetterAudit from '@/models/AuthorizationLetterAudit';
import { requirePermission } from '@/utils/authHelpers';
import { generateAuthorizationLetterHtml } from '@/utils/authorizationLetterGenerator';
import { generatePdfBuffer } from '@/utils/pdfGenerator';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response: authResponse, session } = await requirePermission('authorization.download');
    if (!authorized) return authResponse;

    const { id } = await params;
    await dbConnect();

    // 1. Fetch letter by ID or userId
    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { userId: id }] };
    } else {
      query = { authorizationNumber: id };
    }

    const letter = await AuthorizationLetter.findOne(query).sort({ createdAt: -1 });
    if (!letter) {
      return NextResponse.json({
        success: false,
        message: 'Authorization Letter not found'
      }, { status: 404 });
    }

    // 2. Fetch associated employee details
    const user = await User.findById(letter.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Associated employee not found'
      }, { status: 404 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 3. Log download action to audit trail
    await AuthorizationLetterAudit.create({
      authorizationLetterId: letter._id,
      action: 'download',
      performedBy: session.id,
      ipAddress,
      details: {
        authorizationNumber: letter.authorizationNumber
      }
    });

    // 4. Generate the PDF dynamically on the fly
    const verificationUrl = `https://sakhihub.com/verify/authorization/${letter._id}`;
    const isDCDesignation = ['District Coordinator', 'District Project Officer'].includes(user.designation || '');
    
    const htmlContent = generateAuthorizationLetterHtml({
      employeeName: user.fullName,
      employeeId: user.employeeId || 'PENDING',
      designation: user.designation || 'Representative',
      state: letter.state,
      district: letter.district,
      block: isDCDesignation ? undefined : (letter.block || undefined),
      authorizationNumber: letter.authorizationNumber,
      issueDate: letter.issueDate,
      validUntil: letter.validUntil,
      verificationUrl
    });

    const pdfBuffer = await generatePdfBuffer(htmlContent, undefined, {
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      displayHeaderFooter: false
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AuthorizationLetter_${letter.authorizationNumber}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Download Authorization Letter Error:', error);
    return NextResponse.json({
      success: false,
      message: `Failed to download authorization letter: ${error.message || error}`
    }, { status: 500 });
  }
}
