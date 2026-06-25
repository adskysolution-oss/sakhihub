import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    await dbConnect();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    const sessionUser = session as any;
    const { hasPermission, checkRegionalScope } = await import('@/utils/authHelpers');

    // 1. Role Authorization Check
    if (['super_admin', 'operations_admin'].includes(targetUser.role)) {
      if (sessionUser.role !== 'super_admin') {
        return errorResponse('Forbidden: Insufficient privileges for admin profiles', 403);
      }
    } else {
      let viewPerm = '';
      if (targetUser.role === 'vendor') viewPerm = 'vendors.view';
      else if (targetUser.role === 'sub_vendor') viewPerm = 'sub_vendors.view';
      else if (targetUser.role === 'employee') viewPerm = 'employees.view';
      else if (targetUser.role === 'staff') viewPerm = 'staff.view';
      else if (targetUser.role === 'member') viewPerm = 'members.view';

      const isAuthorized = sessionUser.role === 'super_admin' ||
        sessionUser.role === 'admin' ||
        (viewPerm && await hasPermission(sessionUser.id, sessionUser.role, viewPerm));

      if (!isAuthorized) {
        return errorResponse('Forbidden: Insufficient Permissions', 403);
      }
    }

    // 2. Regional Scope Check
    const withinScope = sessionUser.role === 'super_admin' ||
      sessionUser.role === 'admin' ||
      await checkRegionalScope(targetUser, session);

    if (!withinScope) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    const userObj = targetUser.toObject();
    delete userObj.password;

    return successResponse(userObj, 'User profile retrieved successfully');
  } catch (error: any) {
    console.error('Fetch User Detail Error:', error);
    return errorResponse(error.message || 'Failed to fetch user', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    await dbConnect();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    const sessionUser = session as any;
    const body = await req.json();

    const { hasPermission, checkRegionalScope, logActivity } = await import('@/utils/authHelpers');

    // 1. Role Authorization Check
    if (
      ['super_admin', 'operations_admin'].includes(targetUser.role) ||
      (body.role && ['super_admin', 'operations_admin'].includes(body.role))
    ) {
      if (sessionUser.role !== 'super_admin') {
        return errorResponse('Forbidden: Insufficient privileges for admin profiles', 403);
      }
    } else {
      let updatePerm = '';
      if (targetUser.role === 'vendor') updatePerm = 'vendors.update';
      else if (targetUser.role === 'sub_vendor') updatePerm = 'sub_vendors.update';
      else if (targetUser.role === 'employee') updatePerm = 'employees.update';
      else if (targetUser.role === 'staff') updatePerm = 'staff.update';
      else if (targetUser.role === 'member') updatePerm = 'members.update';

      const isAuthorized = sessionUser.role === 'super_admin' ||
        sessionUser.role === 'admin' ||
        (updatePerm && await hasPermission(sessionUser.id, sessionUser.role, updatePerm));

      if (!isAuthorized) {
        return errorResponse('Forbidden: Insufficient Permissions', 403);
      }
    }

    // 2. Regional Scope Check (Before changes)
    const withinScopeBefore = sessionUser.role === 'super_admin' ||
      sessionUser.role === 'admin' ||
      await checkRegionalScope(targetUser, session);

    if (!withinScopeBefore) {
      return errorResponse('Forbidden: Target user is out of regional scope', 403);
    }

    // 3. New Location Scope Check (If admin changes target user location)
    const updatedLocation = {
      state: body.state !== undefined ? body.state : targetUser.state,
      district: body.district !== undefined ? body.district : targetUser.district,
      block: body.block !== undefined ? body.block : targetUser.block
    };
    if (sessionUser.role !== 'super_admin' && sessionUser.role !== 'admin') {
      const locationWithinScope = await checkRegionalScope(updatedLocation, session);
      if (!locationWithinScope) {
        return errorResponse('Forbidden: New location details are out of regional scope', 403);
      }
    }

    // 4. Input Validations
    if (body.fullName !== undefined && (!body.fullName || typeof body.fullName !== 'string')) {
      return errorResponse('Full name is required and must be a string', 400);
    }

    if (body.mobile !== undefined) {
      if (!body.mobile || typeof body.mobile !== 'string' || !/^\d{10}$/.test(body.mobile)) {
        return errorResponse('Mobile must be exactly 10 digits', 400);
      }
      const existingMobile = await User.findOne({ mobile: body.mobile, _id: { $ne: id } });
      if (existingMobile) {
        return errorResponse('Mobile number is already registered by another user', 400);
      }
    }

    if (body.email !== undefined && body.email) {
      if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        return errorResponse('Invalid email format', 400);
      }
      const existingEmail = await User.findOne({ email: body.email, _id: { $ne: id } });
      if (existingEmail) {
        return errorResponse('Email address is already registered by another user', 400);
      }
    }

    // Direct password modification must be ignored/prevented
    if (body.password !== undefined) {
      delete body.password;
    }

    // 5. Diff Tracking for Audit Log
    const editableFields = [
      'fullName', 'mobile', 'email', 'role', 'designation',
      'membershipType', 'subscriptionPaid', 'depositPaid', 'paymentCompleted',
      'state', 'district', 'block', 'area', 'pincode', 'address',
      'workState', 'workDistrict', 'workBlock', 'workTehsil', 'workPincode', 'workArea', 'workAddress',
      'gender', 'dob', 'qualification', 'experience', 'aadhaarNumber', 'panNumber', 'bankDetails',
      'isPublicVisible'
    ];

    const updatedFields: string[] = [];
    const previousValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    for (const field of editableFields) {
      if (body[field] !== undefined) {
        let hasChanged = false;

        if (field === 'bankDetails') {
          const oldBank = targetUser.bankDetails || {};
          const newBank = body.bankDetails || {};
          if (
            oldBank.bankName !== newBank.bankName ||
            oldBank.accountHolderName !== newBank.accountHolderName ||
            oldBank.accountNumber !== newBank.accountNumber ||
            oldBank.ifscCode !== newBank.ifscCode ||
            oldBank.branchName !== newBank.branchName
          ) {
            hasChanged = true;
          }
        } else if (field === 'dob') {
          const oldDate = targetUser.dob ? new Date(targetUser.dob).getTime() : null;
          const newDate = body.dob ? new Date(body.dob).getTime() : null;
          if (oldDate !== newDate) {
            hasChanged = true;
          }
        } else {
          if (targetUser[field] !== body[field]) {
            hasChanged = true;
          }
        }

        if (hasChanged) {
          updatedFields.push(field);
          previousValues[field] = targetUser[field];
          newValues[field] = body[field];

          targetUser[field] = body[field];
        }
      }
    }

    if (updatedFields.length > 0) {
      targetUser.updatedAt = new Date();
      await targetUser.save();

      // Write Audit Log
      const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
      await logActivity(
        'admin_edit_user_profile',
        sessionUser.id,
        targetUser._id,
        ip,
        {
          updatedFields,
          previousValues,
          newValues
        }
      );
    }

    const updatedUserObj = targetUser.toObject();
    delete updatedUserObj.password;

    return successResponse(updatedUserObj, 'User profile updated successfully');
  } catch (error: any) {
    console.error('Update User Profile Error:', error);
    return errorResponse(error.message || 'Failed to update user profile', 500);
  }
}
