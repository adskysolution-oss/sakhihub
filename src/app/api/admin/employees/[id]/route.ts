import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { errorResponse, successResponse } from '@/utils/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { designation, parentVendorId, gender, dob } = body;

    await dbConnect();
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return errorResponse('Employee not found', 404);
    }

    if (userToUpdate.role !== 'employee') {
      return errorResponse('User is not an employee', 400);
    }

    const updateData: any = { updatedAt: new Date() };
    
    if ('designation' in body) updateData.designation = designation;
    if ('parentVendorId' in body) updateData.parentVendorId = parentVendorId;
    if ('gender' in body) updateData.gender = gender;
    if ('dob' in body) {
      updateData.dob = dob ? new Date(dob) : null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse(updatedUser, 'Employee details updated successfully');
  } catch (error: any) {
    console.error('Update Employee Error:', error);
    return errorResponse(error.message || 'Internal Server Error', 500);
  }
}
