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

    const AuditLog = (await import('@/models/AuditLog')).default;

    // Activation Isolation Rule: Run activation integrity check ONLY for users in pending_registration
    if (user.status === 'pending_registration') {
      const WomenMember = (await import('@/models/WomenMember')).default;
      const memberDoc = await WomenMember.findOne({ userId: user._id });

      if (!memberDoc) {
        await AuditLog.create({
          action: 'ACTIVATION_FAILED_NO_MEMBER',
          performedBy: user._id,
          targetUser: user._id,
          details: { reason: 'No WomenMember profile associated' }
        });
        return errorResponse('Activation failed: Member profile not found', 400);
      }

      const assignedEmployeeId = memberDoc.assignedEmployeeId;
      if (!assignedEmployeeId) {
        await AuditLog.create({
          action: 'ACTIVATION_FAILED_NO_EMPLOYEE',
          performedBy: user._id,
          targetUser: user._id,
          details: { reason: 'No assigned employee associated' }
        });
        return errorResponse('Activation failed: No assigned employee associated', 400);
      }

      // Check employee status (must exist and be active/approved)
      const employeeUser = await User.findById(assignedEmployeeId);
      if (!employeeUser || !['active', 'approved'].includes(employeeUser.status)) {
        await AuditLog.create({
          action: 'ACTIVATION_FAILED_INVALID_EMPLOYEE',
          performedBy: user._id,
          targetUser: user._id,
          details: {
            reason: 'Assigned employee is inactive or not found',
            employeeId: assignedEmployeeId,
            employeeStatus: employeeUser ? employeeUser.status : 'not_found'
          }
        });
        return errorResponse('Activation failed: Assigned employee is invalid or inactive. Please contact support.', 400);
      }

      // Complete Activation Updates
      user.status = 'active';
      user.onboardingCompleted = true;
      user.dashboardAccess = true;
      user.emailVerified = true;

      memberDoc.accountStatus = 'active';
      await memberDoc.save();

      // Log verification and activation
      await AuditLog.create({
        action: 'ACTIVATION_OTP_VERIFIED',
        performedBy: user._id,
        targetUser: user._id
      });

      await AuditLog.create({
        action: 'ACCOUNT_ACTIVATED',
        performedBy: user._id,
        targetUser: user._id,
        details: { method: 'employee_assisted', employeeId: assignedEmployeeId }
      });
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
