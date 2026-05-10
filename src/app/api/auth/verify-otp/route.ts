import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyOTP } from '@/lib/otp';
import { successResponse, errorResponse } from '@/utils/response';
import { sendEmail } from '@/lib/email';
import { getWelcomeTemplate } from '@/lib/emailTemplates';
import EmailLog from '@/models/EmailLog';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, otp, purpose } = await req.json();

    if (!email || !otp) {
      return errorResponse('Email and OTP are required', 400);
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
      
      if (user.otpAttempts >= 5) {
        return errorResponse('Too many failed attempts. Please request a new OTP.', 400);
      }
      return errorResponse('Invalid OTP', 400);
    }

    // Success
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    
    // Activate account based on role
    // For employees, we might still want admin approval, but prompt says "activate account"
    // I'll set status to active for all if purpose was registration
    if (purpose === 'Registration') {
      user.status = 'active';
    }
    
    await user.save();

    // Send Welcome Email if purpose was registration
    if (purpose === 'Registration' && !user.welcomeEmailSent) {
      const isPending = user.role === 'employee' && false; // Change to true if admin approval still needed
      const welcomeHtml = getWelcomeTemplate(user.fullName, user.role, isPending);
      
      sendEmail(user.email!, 'Welcome to SakhiHub!', welcomeHtml).then(async (res) => {
        if (res.success) {
          user.welcomeEmailSent = true;
          await user.save();
        }
        
        await EmailLog.create({
          recipient: user.email!,
          subject: 'Welcome to SakhiHub!',
          type: 'welcome_email',
          status: res.success ? 'success' : 'failed',
          error: res.success ? undefined : (res.error as any)?.message,
          relatedId: user._id
        });
      });
    }

    return successResponse(
      { status: user.status, emailVerified: user.emailVerified },
      'OTP verified successfully'
    );
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
