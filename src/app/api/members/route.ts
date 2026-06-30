import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import mongoose from 'mongoose';
import Group from '@/models/Group';
import MemberRequest from '@/models/MemberRequest';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { notifyGroupAddition } from '@/lib/notifications';

import { generateOTP, hashOTP } from '@/lib/otp';

async function deliverOTP(user: any, rawOtp: string, purpose: string, creatorName?: string) {
  if (process.env.OTP_DELIVERY_METHOD === 'sms') {
    // Future SMS implementation:
    // await sendSMS(user.mobile, `Your SakhiHub OTP is ${rawOtp}`);
  } else {
    // Current Email implementation:
    const { sendEmail } = await import('@/lib/email');
    const { getActivationTemplate, getOTPTemplate } = await import('@/lib/emailTemplates');
    
    let subject = `Your SakhiHub OTP for ${purpose}`;
    let html = getOTPTemplate(user.fullName, rawOtp, purpose);

    if (purpose === 'Account Activation') {
      subject = 'Activate your SakhiHub Account';
      html = getActivationTemplate(user.fullName, rawOtp, user.email, creatorName || 'our executive');
    }

    const res = await sendEmail(user.email, subject, html);
    return res;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    const userId = (session as any).id;
    
    if (!body.email) {
      return errorResponse('Email is required', 400);
    }
    if (!body.mobile) {
      return errorResponse('Mobile number is required', 400);
    }

    // Fetch creator's profile for hierarchy
    const userProfile = await User.findById(userId);

    // Duplicate User Protection
    const existingUser = await User.findOne({
      $or: [
        { email: body.email },
        { mobile: body.mobile }
      ]
    });

    const AuditLog = (await import('@/models/AuditLog')).default;

    if (existingUser) {
      if (existingUser.status === 'pending_registration') {
        // Verify resend cooldown (60 seconds)
        if (existingUser.lastOtpSentAt) {
          const diff = Date.now() - new Date(existingUser.lastOtpSentAt).getTime();
          if (diff < 60 * 1000) {
            return errorResponse(`Please wait ${Math.ceil((60 * 1000 - diff) / 1000)}s before requesting a new OTP`, 400);
          }
        }

        const rawOtp = generateOTP();
        existingUser.otp = hashOTP(rawOtp);
        existingUser.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
        existingUser.lastOtpSentAt = new Date();
        existingUser.otpAttempts = 0;
        await existingUser.save();

        // Deliver activation OTP email
        const creatorName = userProfile?.fullName || 'our executive';
        await deliverOTP(existingUser, rawOtp, 'Account Activation', creatorName);

        // Audit Log
        await AuditLog.create({
          action: 'ACTIVATION_EMAIL_RESENT',
          performedBy: new mongoose.Types.ObjectId(userId),
          targetUser: existingUser._id,
          details: { email: body.email, mobile: body.mobile }
        });

        return successResponse(null, 'Member registration is pending. Activation email has been resent.', 200);
      } else {
        return errorResponse('A user with this email or mobile number already exists and is active.', 400);
      }
    }

    // Auto-populate district and block from group if missing
    const group = await Group.findById(body.groupId);
    if (!group) {
      return errorResponse('Associated group not found', 404);
    }

    if (!body.district) body.district = group.district;
    if (!body.block) body.block = group.block;

    // Generate Activation OTP
    const rawOtp = generateOTP();
    const hashedOtp = hashOTP(rawOtp);

    // Create User record in pending_registration
    const newUser = await User.create({
      fullName: body.name,
      mobile: body.mobile,
      email: body.email,
      role: 'member',
      status: 'pending_registration',
      parentVendorId: new mongoose.Types.ObjectId(userId),
      parentEmployeeCode: userProfile?.employeeId,
      parentVendorCode: userProfile?.vendorCode,
      parentSubVendorCode: userProfile?.subVendorCode,
      assignmentStatus: 'completed',
      otp: hashedOtp,
      otpExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      lastOtpSentAt: new Date(),
      otpAttempts: 0,
      emailVerified: false,
      dashboardAccess: false,
      onboardingCompleted: false,
      paymentCompleted: true,
      referralSource: 'invite'
    });

    const member = await WomenMember.create({
      ...body,
      userId: newUser._id,
      createdBy: new mongoose.Types.ObjectId(userId),
      assignedEmployeeId: new mongoose.Types.ObjectId(userId),
      vendorCode: userProfile?.vendorCode,
      subVendorCode: userProfile?.subVendorCode,
      requestedBy: 'employee',
      connectionStatus: 'approved',
      accountStatus: 'inactive',
      membershipStatus: 'free'
    });

    // Deliver activation OTP email
    const creatorName = userProfile?.fullName || 'our executive';
    await deliverOTP(newUser, rawOtp, 'Account Activation', creatorName);

    // Audit logs
    await AuditLog.create({
      action: 'EMPLOYEE_MEMBER_CREATED',
      performedBy: new mongoose.Types.ObjectId(userId),
      targetUser: newUser._id,
      details: { email: body.email, mobile: body.mobile }
    });

    await AuditLog.create({
      action: 'ACTIVATION_EMAIL_SENT',
      performedBy: new mongoose.Types.ObjectId(userId),
      targetUser: newUser._id,
      details: { email: body.email }
    });

    // Notify group addition asynchronously
    if (member.groupId && member.email) {
      notifyGroupAddition(member._id, member.groupId.toString(), userId);
    }

    return successResponse(member, 'Member added successfully. Activation email sent.', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const mode = searchParams.get('mode');
    const role = (session as any).role;
    const userId = (session as any).id;
    const userProfile = await User.findById(userId);

    let query: any = {};
    const groupId = searchParams.get('groupId');

    if (groupId && role === 'employee') {
      const group = await Group.findById(groupId);
      if (!group) return errorResponse('Group not found', 404);
      
      let isAuthorized = group.createdBy.toString() === userId;
      if (!isAuthorized) {
        const { isReportingEmployee } = await import('@/utils/hierarchy');
        const creatorUser = await User.findById(group.createdBy);
        isAuthorized = creatorUser && userProfile && await isReportingEmployee(userProfile, creatorUser);
      }
      if (!isAuthorized) {
        return errorResponse('Forbidden: You do not have access to this group\'s members', 403);
      }
      query = { groupId };
    } else if (mode === 'discovery' && role === 'employee') {
      const employee = userProfile;
      if (!employee) return errorResponse('Employee not found', 404);
      
      // Get ObjectIds of members with active pending requests
      const pendingMemberIds = await MemberRequest.distinct('memberId', { status: 'pending' });

      query = {
        connectionStatus: 'unassigned',
        accountStatus: 'active',
        $or: [
          { block: employee.block },
          { district: employee.district }
        ],
        userId: { 
          $exists: true,
          $nin: pendingMemberIds
        }
      };

      console.log("[DEBUG] /api/members discovery query:", JSON.stringify(query), "pendingMemberIds count:", pendingMemberIds.length);
    } else if (role === 'employee') {
      const empObjectId = new mongoose.Types.ObjectId(userId);
      const mappedUsers = await User.find({ parentVendorId: empObjectId, role: 'member' }).select('_id');
      const mappedUserIds = mappedUsers.map(u => u._id);

      query.connectionStatus = 'approved';
      query.$or = [
        { createdBy: empObjectId }, 
        { assignedEmployeeId: empObjectId },
        { userId: { $in: mappedUserIds } }
      ];
    } else if (role === 'vendor') {
      query = { vendorCode: userProfile?.vendorCode };
    } else if (role === 'sub_vendor') {
      query = { subVendorCode: userProfile?.subVendorCode };
    } else if (role !== 'super_admin') {
      return errorResponse('Forbidden', 403);
    }

    if (groupId && !query.groupId) {
      query.groupId = groupId;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: [
            { name: searchRegex },
            { mobile: searchRegex }
          ]}
        ];
        delete query.$or;
      } else {
        query.$or = [
          { name: searchRegex },
          { mobile: searchRegex }
        ];
      }
    }

    const members = await WomenMember.find(query)
      .sort({ createdAt: -1 })
      .populate('groupId', 'groupName village')
      .populate('assignedEmployeeId', 'fullName mobile employeeId')
      .populate({
        path: 'userId',
        select: 'parentVendorId parentEmployeeCode parentVendorCode parentSubVendorCode status otpExpires',
        populate: {
          path: 'parentVendorId',
          select: 'fullName mobile employeeId'
        }
      });

    // Deduplicate and process members
    const uniqueMembersMap = new Map();

    members.forEach(member => {
      // Filter out orphan records (referenced User has been deleted)
      if (member.userId === null) return;

      let activationStatus = 'Activated';
      if (member.userId && typeof member.userId === 'object') {
        const userDoc = member.userId as any;
        if (userDoc.status === 'pending_registration') {
          const isExpired = userDoc.otpExpires && new Date() > new Date(userDoc.otpExpires);
          activationStatus = isExpired ? 'Activation Expired' : 'Pending Activation';
        }
      }

      // Use mobile as unique key
      if (!uniqueMembersMap.has(member.mobile)) {
        // Determine the assigned employee fallback
        const employee = member.assignedEmployeeId || (member.userId as any)?.parentVendorId;

        uniqueMembersMap.set(member.mobile, {
          ...member.toObject(),
          assignedEmployeeId: employee, // Unified employee field
          paymentStatus: member.membershipStatus === 'paid' ? 'Paid' : 'Pending',
          accountStatus: member.accountStatus,
          connectionStatus: member.connectionStatus,
          activationStatus: activationStatus
        });
      }
    });

    return successResponse(Array.from(uniqueMembersMap.values()));
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
