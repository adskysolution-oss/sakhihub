import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { identifier, password, role } = await req.json(); // identifier can be mobile or email

    if (!identifier || !password) {
      return errorResponse('Identifier and Password are required', 400);
    }

    // Find user by mobile or email
    const user = await User.findOne({
      $or: [{ mobile: identifier }, { email: identifier }],
    });

    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }

    // Verify role if specified (Strict Separation)
    if (role === 'admin') {
      if (user.role !== 'super_admin') {
        return errorResponse('Only Super Admin can access this portal', 403);
      }
    } else if (role === 'member' || role === 'employee') {
      if (user.role === 'super_admin') {
        return errorResponse('Super Admin must use the Admin Portal', 403);
      }
      if (user.role !== role) {
        return errorResponse(`Unauthorized for ${role} access`, 403);
      }
    } else {
      // Default fallback if no role is passed (should not happen with new UI)
      if (user.role === 'super_admin') {
        return errorResponse('Please use the Admin Portal', 403);
      }
    }

    // Check status
    if (user.status === 'pending') {
      return errorResponse('Your account is pending approval by Admin.', 403);
    }
    if (user.status === 'inactive' || user.status === 'rejected') {
      return errorResponse('Your account is disabled or rejected.', 403);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse('Invalid credentials', 401);
    }

    const token = signToken({ 
      id: user._id, 
      role: user.role, 
      fullName: user.fullName 
    });
    
    await setAuthCookie(token);

    return successResponse(
      { 
        id: user._id, 
        fullName: user.fullName, 
        role: user.role 
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login Error:', error);
    return errorResponse('Internal Server Error', 500);
  }
}
