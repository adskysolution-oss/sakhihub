import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateOTP, hashOTP } from '@/lib/otp';
import { successResponse, errorResponse } from '@/utils/response';
import { sendEmail } from '@/lib/email';
import { getOTPTemplate } from '@/lib/emailTemplates';
import EmailLog from '@/models/EmailLog';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, purpose } = await req.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Rate limiting: 60 seconds
    if (user.lastOtpSentAt) {
      const diff = Date.now() - new Date(user.lastOtpSentAt).getTime();
      if (diff < 60 * 1000) {
        return errorResponse(`Please wait ${Math.ceil((60 * 1000 - diff) / 1000)}s before requesting a new OTP`, 400);
      }
    }

    const rawOtp = generateOTP();
    user.otp = hashOTP(rawOtp);
    user.otpExpires = new Date(Date.now() + (purpose === 'Account Activation' ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000));
    user.lastOtpSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();

    // Send Email
    let subject = `Your SakhiHub OTP for ${purpose || 'Verification'}`;
    let html = getOTPTemplate(user.fullName, rawOtp, purpose || 'Verification');

    if (purpose === 'Account Activation') {
      subject = 'Activate your SakhiHub Account';
      const { getActivationTemplate } = await import('@/lib/emailTemplates');
      const employeeUser = await User.findById(user.parentVendorId);
      const employeeName = employeeUser?.fullName || 'our executive';
      html = getActivationTemplate(user.fullName, rawOtp, email, employeeName);
    }

    const res = await sendEmail(email, subject, html);

    await EmailLog.create({
      recipient: email,
      subject,
      type: 'resend_otp',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message,
      relatedId: user._id
    });

    if (purpose === 'Account Activation') {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'ACTIVATION_EMAIL_RESENT',
        performedBy: user.parentVendorId || user._id,
        targetUser: user._id,
        details: { email }
      });
    }

    if (!res.success) {
      return errorResponse('Failed to send email. Please try again later.', 500);
    }

    return successResponse(null, 'New OTP has been sent to your email');
  } catch (error: any) {
    console.error('Resend OTP Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
