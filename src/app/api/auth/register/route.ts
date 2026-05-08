import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      fullName, mobile, whatsapp, email, password, role, 
      designation, qualification, experience, state, district, 
      block, area, address 
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

    const newUser = await User.create({
      fullName,
      mobile,
      whatsapp,
      email,
      password: hashedPassword,
      role: role || 'member',
      designation,
      qualification,
      experience,
      state,
      district,
      block,
      area,
      address,
      status: role === 'super_admin' ? 'active' : 'pending',
    });

    return successResponse(
      { id: newUser._id, role: newUser.role },
      'Registration successful. Please login.',
      201
    );
  } catch (error: any) {
    console.error('Registration Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
