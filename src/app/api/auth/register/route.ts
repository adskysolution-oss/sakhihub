import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { generateOTP, hashOTP } from '@/lib/otp';
import { sendEmail } from '@/lib/email';
import { getOTPTemplate } from '@/lib/emailTemplates';
import EmailLog from '@/models/EmailLog';
import { validatePassword } from '@/utils/validation';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      fullName, mobile, email, password, role, 
      designation, qualification, experience, state, district, 
      block, area, pincode, address, assignedEmployeeId,
      age, maritalStatus, occupation, interests,
      vendorCode, subVendorCode, campaignId
    } = body;

    if (!fullName || !mobile || !password || !email) {
      return errorResponse('Missing required fields: Name, Mobile, Email, Password', 400);
    }

    // Password Validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return errorResponse(`Weak password: ${passwordValidation.errors.join(', ')}`, 400);
    }

    if (!/^\d{10}$/.test(mobile)) {
      return errorResponse('Invalid mobile number. Must be 10 digits.', 400);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Check if user already exists in main collection
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
      return errorResponse('User with this mobile or email already exists', 400);
    }

    // Hierarchy Logic
    let parentVendorId = undefined;
    let referralSource: 'direct' | 'invite' = 'direct';
    let assignmentStatus: 'pending' | 'completed' = 'pending';

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
      const isObjectId = mongoose.Types.ObjectId.isValid(effectiveEmployeeCode);
      const employee = await User.findOne({ 
        $or: [
          { employeeId: effectiveEmployeeCode }, 
          ...(isObjectId ? [{ _id: effectiveEmployeeCode as any }] : [])
        ], 
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

    // OTP logic
    const rawOtp = generateOTP();
    const hashedOtp = hashOTP(rawOtp);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Remove any existing pending registration for this email/mobile to prevent spam/clutter
    await PendingUser.deleteMany({ $or: [{ email }, { mobile }] });

    // Save to PendingUser
    const pendingData: any = {
      fullName,
      mobile,
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
      otp: hashedOtp,
      otpExpires,
      parentVendorId: parentVendorId || undefined,
      parentVendorCode: effectiveVendorCode || undefined,
      parentSubVendorCode: effectiveSubVendorCode || undefined,
      parentEmployeeCode: effectiveEmployeeCode || undefined,
      campaignId: campaignId || undefined,
      campaignCode: body.campaign || undefined,
      // Extra member fields
      age,
      maritalStatus,
      occupation,
      interests,
      assignedEmployeeId: assignedEmployeeId || undefined
    };

    const pendingUser = await PendingUser.create(pendingData);

    // Send Email
    const emailRes = await sendEmail(
      email, 
      'Verify your SakhiHub account', 
      getOTPTemplate(fullName, rawOtp, 'Registration')
    );

    await EmailLog.create({
      recipient: email,
      subject: 'Verify your SakhiHub account',
      type: 'registration_otp',
      status: emailRes.success ? 'success' : 'failed',
      error: emailRes.success ? undefined : (emailRes.error as any)?.message,
      relatedId: pendingUser._id
    });

    return successResponse(
      { email, requiresOtp: true },
      'OTP sent to your email. Please verify to complete registration.',
      201
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

