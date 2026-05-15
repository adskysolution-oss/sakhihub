import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PendingUser from '@/models/PendingUser';
import WomenMember from '@/models/WomenMember';
import MemberRequest from '@/models/MemberRequest';
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

    if (purpose === 'Registration') {
      const pendingUser = await PendingUser.findOne({ email });
      if (!pendingUser) {
        return errorResponse('Registration session not found or expired', 404);
      }

      if (new Date() > pendingUser.otpExpires) {
        return errorResponse('OTP has expired. Please register again.', 400);
      }

      if (!verifyOTP(otp, pendingUser.otp)) {
        pendingUser.otpAttempts = (pendingUser.otpAttempts || 0) + 1;
        await pendingUser.save();
        
        if (pendingUser.otpAttempts >= 5) {
          await PendingUser.deleteOne({ _id: pendingUser._id });
          return errorResponse('Too many failed attempts. Registration session cleared.', 400);
        }
        return errorResponse('Invalid OTP', 400);
      }

      // Success - Create Final User
      const userRole = pendingUser.role;
      
      // Generate unique codes
      const myVendorCode = userRole === 'vendor' ? `VND${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined;
      const mySubVendorCode = userRole === 'sub_vendor' ? `SVN${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined;
      const myEmployeeId = userRole === 'employee' ? `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}` : undefined;

      // Status Enforcement
      let userStatus = userRole === 'super_admin' ? 'active' : 'pending';
      let memberAccountStatus = 'active';
      let memberConnectionStatus = pendingUser.assignedEmployeeId ? 'pending_request' : 'unassigned';

      if (userRole === 'member' && pendingUser.parentVendorId) {
        userStatus = 'active'; 
        memberAccountStatus = 'active';
        memberConnectionStatus = 'approved';
      }

      const userData: any = {
        fullName: pendingUser.fullName,
        mobile: pendingUser.mobile,
        email: pendingUser.email,
        password: pendingUser.password,
        role: userRole,
        designation: pendingUser.designation,
        qualification: pendingUser.qualification,
        experience: pendingUser.experience,
        state: pendingUser.state,
        district: pendingUser.district,
        block: pendingUser.block,
        area: pendingUser.area,
        pincode: pendingUser.pincode,
        address: pendingUser.address,
        aadhaarNumber: pendingUser.aadhaarNumber,
        status: userStatus,
        assignmentStatus: (userRole === 'super_admin' || userRole === 'vendor') ? 'completed' : (pendingUser.parentVendorId ? 'completed' : 'pending'),
        referralSource: pendingUser.parentVendorId ? 'invite' : 'direct',
        emailVerified: true,
        parentVendorId: pendingUser.parentVendorId,
        parentVendorCode: pendingUser.parentVendorCode,
        parentSubVendorCode: pendingUser.parentSubVendorCode,
        parentEmployeeCode: pendingUser.parentEmployeeCode,
        campaignId: pendingUser.campaignId,
        campaignCode: pendingUser.campaignCode,
        vendorCode: myVendorCode,
        subVendorCode: mySubVendorCode,
        employeeId: myEmployeeId
      };

      const newUser = await User.create(userData);

      // Handle Member Specific Collections
      if (userRole === 'member') {
        await WomenMember.create({
          userId: newUser._id,
          name: newUser.fullName,
          mobile: newUser.mobile,
          email: newUser.email,
          state: newUser.state,
          district: newUser.district,
          block: newUser.block,
          pincode: newUser.pincode,
          address: newUser.address,
          age: pendingUser.age,
          maritalStatus: pendingUser.maritalStatus,
          occupation: pendingUser.occupation,
          interests: pendingUser.interests,
          createdBy: newUser._id,
          assignedEmployeeId: pendingUser.assignedEmployeeId || newUser.parentVendorId,
          accountStatus: memberAccountStatus,
          connectionStatus: memberConnectionStatus,
          membershipStatus: 'free'
        });

        // If it's a direct registration and they chose an employee to connect with
        if (!newUser.parentVendorId && pendingUser.assignedEmployeeId) {
          await MemberRequest.create({
            memberId: newUser._id,
            employeeId: pendingUser.assignedEmployeeId,
            pincode: newUser.pincode,
            requestedBy: 'member',
            status: 'pending'
          });
          
          const { notifyMemberRequest } = await import('@/lib/notifications');
          notifyMemberRequest(pendingUser.assignedEmployeeId.toString(), newUser._id.toString());
        }
      }

      // Cleanup
      await PendingUser.deleteOne({ _id: pendingUser._id });

      // Welcome Email
      const welcomeHtml = getWelcomeTemplate(newUser.fullName, newUser.role, newUser.status === 'pending');
      sendEmail(newUser.email!, 'Welcome to SakhiHub!', welcomeHtml).then(async (res) => {
        await EmailLog.create({
          recipient: newUser.email!,
          subject: 'Welcome to SakhiHub!',
          type: 'welcome_email',
          status: res.success ? 'success' : 'failed',
          error: res.success ? undefined : (res.error as any)?.message,
          relatedId: newUser._id
        });
      });

      return successResponse(
        { id: newUser._id, role: newUser.role, status: newUser.status },
        'Registration completed successfully'
      );
    }

    // Standard User Verification (e.g. Password Reset)
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

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return successResponse(
      { status: user.status, emailVerified: user.emailVerified },
      'OTP verified successfully'
    );
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}

