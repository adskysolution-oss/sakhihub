import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import { requirePermission } from '@/utils/authHelpers';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, response: authResponse } = await requirePermission('authorization.view');
    if (!authorized) return authResponse;

    const { id } = await params;
    await dbConnect();

    // 1. Determine query criteria (support letter ID, user ID, or sequence number)
    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { userId: id }] };
    } else {
      query = { authorizationNumber: id };
    }

    // 2. Pre-fetch to run auto-revocation dynamic sync check
    const preLetter = await AuthorizationLetter.findOne(query).sort({ createdAt: -1 });
    if (preLetter) {
      const { syncAuthorizationLetterStatus } = await import('@/utils/authLetterSync');
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      await syncAuthorizationLetterStatus(preLetter.userId.toString(), ip);
    }

    // 3. Re-fetch details to return latest synced status, populating user details
    const letter = await AuthorizationLetter.findOne(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName employeeId status designation district block state dashboardAccess')
      .populate('generatedBy', 'fullName role')
      .lean();

    if (!letter) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: letter
    });

  } catch (error: any) {
    console.error('Fetch Authorization Letter Error:', error);
    return NextResponse.json({
      success: false,
      message: `Failed to fetch authorization letter: ${error.message || error}`
    }, { status: 500 });
  }
}
