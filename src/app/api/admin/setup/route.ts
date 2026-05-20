import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const hashedPassword = await hashPassword('Sakhi@Hub2026');

    // Check if any super admin already exists
    let admin = await User.findOne({ role: 'super_admin' });
    
    if (admin) {
      admin.email = 'Anil.r@sakhihub.com';
      admin.password = hashedPassword;
      await admin.save();
      return successResponse({
        message: 'Super Admin credentials updated successfully',
        credentials: {
          email: 'Anil.r@sakhihub.com',
          password: 'Sakhi@Hub2026'
        }
      });
    }

    admin = await User.create({
      fullName: 'Super Admin',
      mobile: '9999999999',
      email: 'Anil.r@sakhihub.com',
      password: hashedPassword,
      role: 'super_admin',
      status: 'active',
      designation: 'Platform Owner'
    });

    return successResponse({
      message: 'Super Admin created successfully',
      credentials: {
        email: 'Anil.r@sakhihub.com',
        password: 'Sakhi@Hub2026'
      }
    });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
