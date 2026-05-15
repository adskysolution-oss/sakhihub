import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import User from '@/models/User';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const vendorCode = searchParams.get('vendorCode');
    const subVendorCode = searchParams.get('subVendorCode');
    
    const query: any = {};
    if (vendorCode) query.vendorCode = vendorCode;
    if (subVendorCode) query.subVendorCode = subVendorCode;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await WomenMember.find(query)
      .populate('groupId', 'groupName village district')
      .populate('assignedEmployeeId', 'fullName mobile employeeId')
      .populate({
        path: 'userId',
        select: 'parentVendorId parentEmployeeCode parentVendorCode parentSubVendorCode',
        populate: {
          path: 'parentVendorId',
          select: 'fullName mobile employeeId'
        }
      })
      .sort({ createdAt: -1 });

    // Attach membership status to each member and deduplicate by mobile
    const memberIds = members.map(m => m._id);
    const memberships = await Membership.find({ memberId: { $in: memberIds } });

    const uniqueMembersMap = new Map();

    members.forEach(member => {
      // Use mobile as primary key for uniqueness as per requirements
      if (!uniqueMembersMap.has(member.mobile)) {
        const membership = memberships.find(m => m.memberId.toString() === member._id.toString());
        
        // Determine the assigned employee: 
        // 1. Check direct assignment on WomenMember
        // 2. Check parentVendorId on linked User record (often stores the assigned employee/vendor)
        const employee = member.assignedEmployeeId || (member.userId as any)?.parentVendorId;

        uniqueMembersMap.set(member.mobile, {
          ...member.toObject(),
          assignedEmployeeId: employee, // Unified employee object for UI
          paymentStatus: member.membershipStatus === 'paid' ? 'Paid' : 'Pending',
          membershipId: membership?.membershipId || 'N/A',
          accountStatus: member.accountStatus,
          connectionStatus: member.connectionStatus
        });
      }
    });

    const data = Array.from(uniqueMembersMap.values());

    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const body = await req.json();
    const { id, accountStatus, connectionStatus, assignedEmployeeId } = body;
    if (!id) return errorResponse('Member ID required', 400);

    await dbConnect();
    
    const updateData: any = {};
    if (accountStatus) updateData.accountStatus = accountStatus;
    if (connectionStatus) updateData.connectionStatus = connectionStatus;
    
    if (assignedEmployeeId) {
      updateData.assignedEmployeeId = assignedEmployeeId;
      updateData.connectionStatus = 'approved';
    }
    
    updateData.updatedAt = new Date();

    const member = await WomenMember.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (!member) return errorResponse('Member not found', 404);

    // Finalize hierarchy if employee is assigned
    if (assignedEmployeeId) {
      const employee = await User.findById(assignedEmployeeId);
      if (employee) {
        await User.findByIdAndUpdate(member.userId, {
          parentVendorId: assignedEmployeeId,
          parentEmployeeCode: employee.employeeId,
          parentVendorCode: employee.vendorCode,
          parentSubVendorCode: employee.subVendorCode,
          assignmentStatus: 'completed',
          dashboardAccess: true,
          onboardingCompleted: true,
          status: 'active'
        });
      }
    }

    // Also sync User status if accountStatus is changed
    if (accountStatus) {
      let userStatus = 'pending';
      if (accountStatus === 'active') userStatus = 'active';
      if (accountStatus === 'suspended') userStatus = 'suspended';
      if (accountStatus === 'rejected') userStatus = 'rejected';
      
      await User.findByIdAndUpdate(member.userId, { status: userStatus });
    }

    return successResponse(member, 'Member updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Member ID required', 400);

    await dbConnect();
    
    // Perform Safe Delete / Archive
    const member = await WomenMember.findByIdAndUpdate(id, { 
      accountStatus: 'inactive',
      connectionStatus: 'unassigned' // Release from employee group
    }, { new: true });

    if (!member) return errorResponse('Member not found', 404);

    return successResponse(member, 'Member archived successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
