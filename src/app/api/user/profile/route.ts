import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';
import User from '@/models/User';
import { uploadBuffer } from '@/lib/storage';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const user = await User.findById((session as any).id)
      .select('-password')
      .populate('parentVendorId', 'fullName mobile role');

    if (!user) return errorResponse('User not found', 404);

    return successResponse(user);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const formData = await req.formData();
    const fullName = formData.get('fullName') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;
    const state = formData.get('state') as string;
    const district = formData.get('district') as string;
    const block = formData.get('block') as string;
    const area = formData.get('area') as string;
    const pincode = formData.get('pincode') as string;
    const businessName = formData.get('businessName') as string;
    const file = formData.get('profileImage') as File;

    await dbConnect();
    const user = await User.findById((session as any).id);
    if (!user) return errorResponse('User not found', 404);

    // Update text fields
    if (fullName) user.fullName = fullName;

    // Handle Mobile update with duplicate check
    if (mobile && mobile !== user.mobile) {
      const existing = await User.findOne({ mobile, _id: { $ne: user._id } });
      if (existing) return errorResponse('Mobile number already in use', 400);
      user.mobile = mobile;
    }

    // Email is read-only as per request
    // if (email) user.email = email; 

    if (address) user.address = address;
    if (state) user.state = state;
    if (district) user.district = district;
    if (block) user.block = block;
    if (area) user.area = area;
    if (pincode) user.pincode = pincode;
    if (businessName) user.businessName = businessName;

    // Handle Profile Image Upload
    if (file && typeof file !== 'string') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResult = await uploadBuffer(
        buffer,
        file.type,
        `profiles/${user.role}`,
        {
          uploadedBy: user._id,
          uploadedFor: 'profileImage',
          originalName: file.name
        }
      );

      if (uploadResult?.url) {
        user.profileImage = uploadResult.url;
      }
    }

    await user.save();
    return successResponse(user, 'Profile updated successfully');
  } catch (error: any) {
    console.error('Profile Update Error:', error);
    return errorResponse(error.message, 500);
  }
}
