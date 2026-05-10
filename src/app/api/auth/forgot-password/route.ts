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
    const { email } = await req.json();

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists, but here we need to inform for OTP
      return errorResponse('User with this email not found', 404);
    }

    const rawOtp = generateOTP();
    user.otp = hashOTP(rawOtp);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.lastOtpSentAt = new Date();
    user.otpAttempts = 0;
    await user.save();

    // Send Email
    const res = await sendEmail(
      email, 
      'Reset your SakhiHub Password', 
      getOTPTemplate(user.fullName, rawOtp, 'Password Reset')
    );

    await EmailLog.create({
      recipient: email,
      subject: 'Reset your SakhiHub Password',
      type: 'forgot_password_otp',
      status: res.success ? 'success' : 'failed',
      error: res.success ? undefined : (res.error as any)?.message,
      relatedId: user._id
    });

    if (!res.success) {
      return errorResponse('Failed to send email. Please try again later.', 500);
    }

    return successResponse(null, 'Password reset OTP has been sent to your email');
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
