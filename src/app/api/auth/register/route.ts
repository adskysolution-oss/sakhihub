import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import MemberRequest from '@/models/MemberRequest';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

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
    // - Employees start as 'pending' (Admin approval required)
    // - Members start as 'active' (Login allowed immediately)
    const userStatus = userRole === 'member' ? 'active' : 'pending';

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
    });

    // If role is member, create the business profile in WomenMember collection
    if (userRole === 'member') {
      await WomenMember.create({
        userId: newUser._id,
        name: fullName,
        mobile,
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
          status: 'pending'
        });
      }
    }

    const message = userRole === 'member' 
      ? 'Registration successful. You can login now.' 
      : 'Registration successful. Your account is pending admin approval.';

    return successResponse(
      { id: newUser._id, role: newUser.role, status: newUser.status },
      message,
      201
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
