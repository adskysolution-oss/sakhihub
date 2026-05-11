import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import Campaign from '@/models/Campaign';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import mongoose from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // 1. Fetch User Profile with populated parent/campaign
    const user = await User.findById(id)
      .populate('parentVendorId', 'fullName vendorCode role')
      .populate('campaignId', 'title campaignCode')
      .populate('assignedCampaigns', 'title campaignCode')
      .select('-password');

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const userId = user._id;
    const role = user.role;
    const vendorCode = user.vendorCode;
    const subVendorCode = user.subVendorCode;
    const employeeId = user.employeeId || user._id.toString();

    // 2. Aggregate Data based on Role
    let subVendors: any[] = [];
    let employees: any[] = [];
    let members: any[] = [];
    let groups: any[] = [];
    
    const counts: any = {
      subVendors: 0,
      employees: 0,
      members: 0,
      paidMembers: 0,
      freeMembers: 0,
      groups: 0,
      campaigns: user.assignedCampaigns?.length || 0,
      pendingApprovals: 0
    };

    if (role === 'vendor') {
      // Find Sub-Vendors
      subVendors = await User.find({ parentVendorId: userId, role: 'sub_vendor' }).select('fullName subVendorCode status district block');
      counts.subVendors = subVendors.length;
      const subVendorIds = subVendors.map(sv => sv._id);

      // Find Employees (Direct under Vendor OR under its Sub-Vendors)
      employees = await User.find({ 
        role: 'employee',
        $or: [
          { parentVendorId: userId },
          { parentVendorId: { $in: subVendorIds } }
        ]
      }).select('fullName employeeId status designation district block');
      counts.employees = employees.length;

      // Find Members
      members = await WomenMember.find({ 
        $or: [
          { vendorCode: vendorCode },
          { subVendorCode: { $in: subVendors.map(sv => sv.subVendorCode) } }
        ]
      }).select('name mobile village status membershipStatus connectionStatus assignedEmployeeId');
      counts.members = members.length;
      counts.paidMembers = members.filter((m: any) => m.membershipStatus === 'paid').length;
      counts.freeMembers = members.filter((m: any) => m.membershipStatus === 'free').length;

      // Find Groups
      groups = await Group.find({ 
        $or: [
          { vendorCode: vendorCode },
          { subVendorCode: { $in: subVendors.map(sv => sv.subVendorCode) } }
        ]
      }).select('groupName village totalMembers leaderName');
      counts.groups = groups.length;

      // Pending Approvals in the network
      counts.pendingApprovals = await User.countDocuments({
        $or: [
          { parentVendorId: userId, status: 'pending' },
          { parentVendorId: { $in: subVendorIds }, status: 'pending' }
        ]
      });

    } else if (role === 'sub_vendor') {
      // Find Employees
      employees = await User.find({ parentVendorId: userId, role: 'employee' }).select('fullName employeeId status designation district block');
      counts.employees = employees.length;

      // Find Members
      members = await WomenMember.find({ subVendorCode: subVendorCode }).select('name mobile village status membershipStatus connectionStatus assignedEmployeeId');
      counts.members = members.length;
      counts.paidMembers = members.filter((m: any) => m.membershipStatus === 'paid').length;
      counts.freeMembers = members.filter((m: any) => m.membershipStatus === 'free').length;

      // Find Groups
      groups = await Group.find({ subVendorCode: subVendorCode }).select('groupName village totalMembers leaderName');
      counts.groups = groups.length;

      counts.pendingApprovals = await User.countDocuments({ parentVendorId: userId, status: 'pending' });

    } else if (role === 'employee') {
      // Find Members
      members = await WomenMember.find({ assignedEmployeeId: userId }).select('name mobile village status membershipStatus connectionStatus');
      counts.members = members.length;
      counts.paidMembers = members.filter((m: any) => m.membershipStatus === 'paid').length;
      counts.freeMembers = members.filter((m: any) => m.membershipStatus === 'free').length;

      // Find Groups
      groups = await Group.find({ createdBy: userId }).select('groupName village totalMembers leaderName');
      counts.groups = groups.length;
    }

    return successResponse({
      user,
      counts,
      hierarchy: {
        subVendors,
        employees,
        members,
        groups
      }
    });
  } catch (error: any) {
    console.error('Hierarchy Fetch Error:', error);
    return errorResponse(error.message, 500);
  }
}
