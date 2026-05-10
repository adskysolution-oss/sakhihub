import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import MemberRequest from '@/models/MemberRequest';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { generateOTP, hashOTP } from '@/lib/otp';
import { sendEmail } from '@/lib/email';
import { getOTPTemplate } from '@/lib/emailTemplates';
import EmailLog from '@/models/EmailLog';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      fullName, mobile, whatsapp, email, password, role, 
      designation, qualification, experience, state, district, 
      block, area, pincode, address, assignedEmployeeId,
      age, maritalStatus, occupation, interests
    } = body;

    if (!fullName || !mobile || !password) {
      return errorResponse('Missing required fields: Name, Mobile, Password', 400);
    }

    if (!/^\d{10}$/.test(mobile)) {
      return errorResponse('Invalid mobile number. Must be 10 digits.', 400);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return errorResponse('User with this mobile number already exists', 400);
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return errorResponse('User with this email already exists', 400);
      }
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'member';

    // Business Logic: 
    const userStatus = 'pending'; // Always pending until OTP/Admin approval
    
    // OTP logic
    let otp = undefined;
    let otpExpires = undefined;
    let rawOtp = undefined;

    if (email) {
      rawOtp = generateOTP();
      otp = hashOTP(rawOtp);
      otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    const newUser = await User.create({
      fullName,
      mobile,
      whatsapp,
      email,
      password: hashedPassword,
      role: userRole,
      designation,
      qualification,
      experience,
      state,
      district,
      block,
      area,
      pincode,
      address,
      status: userStatus,
      otp,
      otpExpires,
      lastOtpSentAt: email ? new Date() : undefined,
      emailVerified: false
    });

    // Send Email asynchronously if email provided
    if (email && rawOtp) {
      sendEmail(
        email, 
        'Verify your SakhiHub account', 
        getOTPTemplate(fullName, rawOtp, 'Registration')
      ).then(async (res) => {
        await EmailLog.create({
          recipient: email,
          subject: 'Verify your SakhiHub account',
          type: 'registration_otp',
          status: res.success ? 'success' : 'failed',
          error: res.success ? undefined : (res.error as any)?.message,
          relatedId: newUser._id
        });
      });
    }

    // If role is member, create the business profile in WomenMember collection
    if (userRole === 'member') {
      await WomenMember.create({
        userId: newUser._id,
        name: fullName,
        mobile,
        email,
        state,
        district,
        block,
        pincode,
        address,
        age,
        maritalStatus,
        occupation,
        interests,
        createdBy: newUser._id, // Self-registered
        accountStatus: 'active',
        connectionStatus: assignedEmployeeId ? 'pending_request' : 'unassigned',
        membershipStatus: 'free'
      });

      // If a member selected an employee, create a connection request
      if (assignedEmployeeId) {
        await MemberRequest.create({
          memberId: newUser._id,
          employeeId: assignedEmployeeId,
          pincode: pincode,
          requestedBy: 'member',
          status: 'pending'
        });
        
        // Notify employee
        const { notifyMemberRequest } = await import('@/lib/notifications');
        notifyMemberRequest(assignedEmployeeId, newUser._id);
      }
    }

    const message = email 
      ? 'Registration successful. Please verify the OTP sent to your email.' 
      : 'Registration successful. Your account is pending review.';

    return successResponse(
      { id: newUser._id, role: newUser.role, status: newUser.status, requiresOtp: !!email },
      message,
      201
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
