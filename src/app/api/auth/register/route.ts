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
      age, maritalStatus, occupation, interests,
      vendorCode, subVendorCode, campaignId
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

    // Hierarchy Logic: A + C Hybrid Enforcement
    let parentVendorId = undefined;
    let referralSource: 'direct' | 'invite' = 'direct';
    let assignmentStatus: 'pending' | 'completed' = 'pending';

    // 1. Resolve Parent Mapping (Option A: Invite/Referral)
    const effectiveVendorCode = vendorCode || body.vendor;
    const effectiveSubVendorCode = subVendorCode || body.subvendor;
    const effectiveEmployeeCode = assignedEmployeeId || body.employee;

    if (effectiveVendorCode) {
      const vendor = await User.findOne({ vendorCode: effectiveVendorCode, role: 'vendor' });
      if (vendor) {
        parentVendorId = vendor._id;
        referralSource = 'invite';
        assignmentStatus = 'completed';
      }
    } 
    
    if (!parentVendorId && effectiveSubVendorCode) {
      const subVendor = await User.findOne({ subVendorCode: effectiveSubVendorCode, role: 'sub_vendor' });
      if (subVendor) {
        parentVendorId = subVendor._id;
        referralSource = 'invite';
        assignmentStatus = 'completed';
      }
    } 
    
    if (!parentVendorId && effectiveEmployeeCode) {
      const employee = await User.findOne({ 
        $or: [{ employeeId: effectiveEmployeeCode }, { _id: effectiveEmployeeCode }], 
        role: 'employee' 
      });
      if (employee) {
        parentVendorId = employee._id;
        referralSource = 'invite';
        assignmentStatus = 'completed';
      }
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role || 'member';

    // 2. Status Enforcement
    const userStatus = userRole === 'super_admin' ? 'active' : 'pending';

    // OTP logic
    let otp = undefined;
    let otpExpires = undefined;
    let rawOtp = undefined;

    if (email) {
      rawOtp = generateOTP();
      otp = hashOTP(rawOtp);
      otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    }

    // 3. Unique Code Generation (Never reuse parent's code as own)
    const myVendorCode = userRole === 'vendor' ? `VND${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined;
    const mySubVendorCode = userRole === 'sub_vendor' ? `SVN${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined;
    const myEmployeeId = userRole === 'employee' ? `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined;

    // Create the user object, only including unique codes if they are generated
    const userToCreate: any = {
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
      aadhaarNumber: body.aadhaarNumber,
      status: userStatus,
      assignmentStatus: (userRole === 'super_admin' || userRole === 'vendor') ? 'completed' : assignmentStatus,
      referralSource,
      otp,
      otpExpires,
      lastOtpSentAt: email ? new Date() : undefined,
      emailVerified: false,
      parentVendorId: parentVendorId || undefined,
      parentVendorCode: effectiveVendorCode || undefined,
      parentSubVendorCode: effectiveSubVendorCode || undefined,
      parentEmployeeCode: effectiveEmployeeCode || undefined,
      campaignId: campaignId || undefined,
      campaignCode: body.campaign || undefined
    };

    if (myVendorCode) userToCreate.vendorCode = myVendorCode;
    if (mySubVendorCode) userToCreate.subVendorCode = mySubVendorCode;
    if (myEmployeeId) userToCreate.employeeId = myEmployeeId;

    const newUser = await User.create(userToCreate);

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
