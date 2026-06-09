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
    const workState = formData.get('workState') as string;
    const workDistrict = formData.get('workDistrict') as string;
    const workBlock = formData.get('workBlock') as string;
    const workTehsil = formData.get('workTehsil') as string;
    const workPincode = formData.get('workPincode') as string;
    const workArea = formData.get('workArea') as string;
    const workAddress = formData.get('workAddress') as string;
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

    if (address !== null) user.address = address;
    if (state !== null) user.state = state;
    if (district !== null) user.district = district;
    if (block !== null) user.block = block;
    if (area !== null) user.area = area;
    if (pincode !== null) user.pincode = pincode;
    if (businessName !== null) user.businessName = businessName;

    if (workState !== null) user.workState = workState;
    if (workDistrict !== null) user.workDistrict = workDistrict;
    if (workBlock !== null) user.workBlock = workBlock;
    if (workTehsil !== null) user.workTehsil = workTehsil;
    if (workPincode !== null) user.workPincode = workPincode;
    if (workArea !== null) user.workArea = workArea;
    if (workAddress !== null) user.workAddress = workAddress;

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
