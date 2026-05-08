import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Check if any super admin already exists
    const adminExists = await User.findOne({ role: 'super_admin' });
    
    if (adminExists) {
      return errorResponse('Super Admin already exists. For security, this endpoint is disabled.', 403);
    }

    const hashedPassword = await hashPassword('Admin@123'); // Default password

    const admin = await User.create({
      fullName: 'Super Admin',
      mobile: '9999999999',
      email: 'admin@sakhihub.com',
      password: hashedPassword,
      role: 'super_admin',
      status: 'active',
      designation: 'Platform Owner'
    });

    return successResponse({
      message: 'Super Admin created successfully',
      credentials: {
        identifier: '9999999999',
        password: 'Admin@123'
      }
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
