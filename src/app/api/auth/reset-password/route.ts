import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyOTP } from '@/lib/otp';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return errorResponse('Email, OTP and new password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (!user.otp || !user.otpExpires) {
      return errorResponse('No active OTP found', 400);
    }

    if (new Date() > user.otpExpires) {
      return errorResponse('OTP has expired', 400);
    }

    if (!verifyOTP(otp, user.otp)) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return errorResponse('Invalid OTP', 400);
    }

    // Success - Reset password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return successResponse(null, 'Password has been reset successfully. You can now login with your new password.');
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
