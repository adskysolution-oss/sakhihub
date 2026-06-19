import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import AuthorizationLetterAudit from '@/models/AuthorizationLetterAudit';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // 1. Fetch letter by ID, userId, or authorizationNumber
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
        message: 'Authorization Letter not found or invalid verification ID'
      }, { status: 404 });
    }

    const ipAddress = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // 2. Active Sync check: auto-revoke if employee assignments/status changed
    const { syncAuthorizationLetterStatus } = await import('@/utils/authLetterSync');
    await syncAuthorizationLetterStatus(letter.userId.toString(), ipAddress);

    // 3. Re-read status to capture any auto-revocations
    const syncedLetter = await AuthorizationLetter.findById(letter._id);
    if (!syncedLetter) {
      return NextResponse.json({ success: false, message: 'Authorization Letter not found' }, { status: 404 });
    }

    // 4. Auto-expiry check: if status is active and validUntil < now, mark as expired
    const now = new Date();
    if (syncedLetter.status === 'active' && new Date(syncedLetter.validUntil) < now) {
      syncedLetter.status = 'expired';
      await syncedLetter.save();

      // Log expiry in audit trail
      await AuthorizationLetterAudit.create({
        authorizationLetterId: syncedLetter._id,
        action: 'expire',
        ipAddress,
        details: {
          reason: 'Validity period expired (automatic system update)',
          validUntil: syncedLetter.validUntil
        }
      });
    }

    // 5. Populate user profile details securely
    const user = await User.findById(syncedLetter.userId).lean() as any;
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Associated employee profile not found'
      }, { status: 404 });
    }

    // 6. Return only public, non-sensitive verification details
    const publicVerificationData = {
      employeeName: user.fullName,
      designation: user.designation || 'Representative',
      employeeId: user.employeeId || 'N/A',
      state: syncedLetter.state,
      district: syncedLetter.district,
      block: syncedLetter.block || null,
      authorizationNumber: syncedLetter.authorizationNumber,
      issueDate: syncedLetter.issueDate,
      validUntil: syncedLetter.validUntil,
      status: syncedLetter.status
    };

    return NextResponse.json({
      success: true,
      data: publicVerificationData
    });

  } catch (error: any) {
    console.error('Public Verification Fetch Error:', error);
    return NextResponse.json({
      success: false,
      message: `Failed to verify authorization letter: ${error.message || error}`
    }, { status: 500 });
  }
}
