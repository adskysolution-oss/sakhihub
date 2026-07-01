import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Group from '@/models/Group';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const userId = (session as any).id;
    const role = (session as any).role;

    if (role !== 'employee') {
      return errorResponse('Forbidden: Only employees can create reporting members', 403);
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse('Group not found', 404);
    }

    // Validate permission: Employee must own the group or be a reporting coordinator
    const User = (await import('@/models/User')).default;
    const userProfile = await User.findById(userId);
    
    let isAuthorized = group.createdBy.toString() === userId;
    if (!isAuthorized) {
      const creatorUser = await User.findById(group.createdBy);
      const { isReportingEmployee } = await import('@/utils/hierarchy');
      isAuthorized = !!(creatorUser && userProfile && await isReportingEmployee(userProfile, creatorUser));
    }
    if (!isAuthorized) {
      return errorResponse('Forbidden: You do not have permission to manage this group', 403);
    }

    const body = await req.json();

    if (!body.name) {
      return errorResponse('Name is required', 400);
    }
    if (!body.mobile) {
      return errorResponse('Mobile number is required', 400);
    }

    // Duplicate Validation: mobile number within the same Group
    const duplicate = await WomenMember.findOne({
      groupId: new mongoose.Types.ObjectId(groupId),
      mobile: body.mobile
    });
    if (duplicate) {
      return errorResponse('A member with this mobile number already exists in this group', 400);
    }

    // Start MongoDB Transaction for atomic operation
    const mongooseSession = await mongoose.startSession();
    mongooseSession.startTransaction();

    try {
      // 1. Create WomenMember (omitting userId)
      const [member] = await WomenMember.create(
        [
          {
            name: body.name,
            mobile: body.mobile,
            age: body.age,
            village: body.village || group.village,
            district: body.district || group.district,
            block: body.block || group.block,
            state: body.state || group.state || 'Rajasthan',
            pincode: body.pincode,
            address: body.address,
            maritalStatus: body.maritalStatus,
            occupation: body.occupation,
            interests: body.interests,
            groupId: new mongoose.Types.ObjectId(groupId),
            createdBy: new mongoose.Types.ObjectId(userId),
            assignedEmployeeId: new mongoose.Types.ObjectId(userId),
            vendorCode: userProfile?.vendorCode,
            subVendorCode: userProfile?.subVendorCode,
            memberType: 'REPORTING_MEMBER',
            createdVia: 'EMPLOYEE_GROUP',
            userId: undefined
          }
        ],
        { session: mongooseSession }
      );

      // 2. Increment Group totalMembers count
      group.totalMembers = (group.totalMembers || 0) + 1;
      await group.save({ session: mongooseSession });

      // 3. Log event using existing activity logging system
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create(
        [
          {
            action: 'REPORTING_MEMBER_CREATED',
            performedBy: new mongoose.Types.ObjectId(userId),
            details: {
              employeeId: userId,
              groupId: groupId,
              memberId: member._id,
              timestamp: new Date()
            }
          }
        ],
        { session: mongooseSession }
      );

      await mongooseSession.commitTransaction();
      mongooseSession.endSession();

      return successResponse(member, 'Reporting member added successfully', 201);
    } catch (txError: any) {
      await mongooseSession.abortTransaction();
      mongooseSession.endSession();
      throw txError;
    }
  } catch (error: any) {
    console.error('Reporting Member Creation Error:', error);
    return errorResponse(error.message || 'Failed to create reporting member', 500);
  }
}
