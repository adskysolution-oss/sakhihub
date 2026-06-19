import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import AuthorizationLetterAudit from '@/models/AuthorizationLetterAudit';
import { requirePermission } from '@/utils/authHelpers';
import mongoose from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response: authResponse, session } = await requirePermission('authorization.revoke');
    if (!authorized) return authResponse;

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

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

    if (letter.status === 'revoked') {
      return NextResponse.json({
        success: false,
        message: 'Authorization Letter is already revoked'
      }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 2. Perform revocation
    letter.status = 'revoked';
    await letter.save();

    // 3. Log to audit trail
    await AuthorizationLetterAudit.create({
      authorizationLetterId: letter._id,
      action: 'revoke',
      performedBy: session.id,
      ipAddress,
      details: {
        reason: reason || 'Revoked manually by administrator',
        authorizationNumber: letter.authorizationNumber
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Authorization Letter has been successfully revoked',
      data: letter
    });

  } catch (error: any) {
    console.error('Revoke Authorization Letter Error:', error);
    return NextResponse.json({
      success: false,
      message: `Failed to revoke authorization letter: ${error.message || error}`
    }, { status: 500 });
  }
}
