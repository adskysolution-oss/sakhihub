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
      .sort({ createdAt: -1 });

    // Attach membership status to each member
    const memberIds = members.map(m => m._id);
    const memberships = await Membership.find({ memberId: { $in: memberIds } });

    const data = members.map(member => {
      const membership = memberships.find(m => m.memberId.toString() === member._id.toString());
      return {
        ...member.toObject(),
        paymentStatus: member.membershipStatus === 'paid' ? 'Paid' : 'Pending', // Sync with new status field
        membershipId: membership?.membershipId || 'N/A',
        accountStatus: member.accountStatus,
        connectionStatus: member.connectionStatus
      };
    });

    return successResponse(data);
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
