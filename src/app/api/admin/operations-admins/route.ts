import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const admins = await User.find({
      $or: [
        { role: { $in: ['operations_admin', 'staff'] } },
        { 
          role: 'employee', 
          designation: { $in: ['District Coordinator', 'District Project Officer'] } 
        }
      ]
    }).select('-password').sort({ createdAt: -1 });
    return successResponse(admins);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { fullName, email, mobile, password, designation } = await req.json();

    if (!fullName || !mobile || !password) {
      return errorResponse('FullName, Mobile, and Password are required', 400);
    }

    // Check if user already exists with mobile or email
    const existingUser = await User.findOne({
      $or: [{ mobile }, ...(email ? [{ email }] : [])]
    });

    if (existingUser) {
      return errorResponse('User with this email or mobile already exists', 400);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      role: 'operations_admin',
      designation: designation || 'Operations Admin',
      status: 'active',
      isVerified: true,
      onboardingCompleted: true,
      documentsVerified: true,
      dashboardAccess: true,
      paymentCompleted: true, // Admin role is free/exempted from payment
      assignmentStatus: 'completed'
    });

    const { logActivity } = await import('@/utils/authHelpers');
    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    await logActivity('operations_admin_created', (session as any).id, newUser._id, ip, {
      fullName,
      email,
      mobile,
      designation
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return successResponse(userObj, 'Operations Admin created successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
