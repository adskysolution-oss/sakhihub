import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'sub_vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const subVendorId = (session as any).id;
    
    // 1. Fetch only ACTIVE/APPROVED operational records
    const operationalStatuses = ['active', 'approved'];

    const subVendor = await User.findOne({ 
      _id: subVendorId,
      status: { $in: operationalStatuses } 
    }).select('fullName subVendorCode role mobile status district block profileImage');

    if (!subVendor) return errorResponse('Active sub-vendor record not found', 404);

    // 2. Fetch downstream network
    const employees = await User.find({
      role: 'employee',
      status: { $in: operationalStatuses },
      parentVendorId: subVendorId
    }).select('fullName employeeId role mobile status district block parentVendorId profileImage');

    const employeeIds = employees.map(emp => emp._id);

    const members = await WomenMember.find({
      accountStatus: 'active',
      $or: [
        { subVendorCode: subVendor.subVendorCode },
        { assignedEmployeeId: { $in: employeeIds } }
      ]
    }).select('name mobile village status membershipStatus assignedEmployeeId subVendorCode vendorCode');

    // 3. Build Hierarchy Tree
    const tree: any = {
      id: subVendor._id.toString(),
      name: subVendor.fullName,
      code: subVendor.subVendorCode,
      role: 'sub_vendor',
      mobile: subVendor.mobile,
      children: []
    };

    const nodeMap: Record<string, any> = {};
    nodeMap[subVendor._id.toString()] = tree;

    // Process Employees
    employees.forEach(emp => {
      const id = emp._id.toString();
      const node = {
        id,
        name: emp.fullName,
        code: emp.employeeId,
        role: 'employee',
        mobile: emp.mobile,
        status: emp.status,
        location: `${emp.block || ''}, ${emp.district || ''}`,
        profileImage: emp.profileImage,
        children: []
      };
      nodeMap[id] = node;

      // Direct employee of sub-vendor
      tree.children.push(node);
    });

    // Process Members
    members.forEach(m => {
      const node = {
        id: m._id.toString(),
        name: m.name,
        code: m.mobile,
        role: 'member',
        mobile: m.mobile,
        status: m.membershipStatus,
        location: m.village,
        children: []
      };

      if (m.assignedEmployeeId && nodeMap[m.assignedEmployeeId.toString()]) {
        nodeMap[m.assignedEmployeeId.toString()].children.push(node);
      } else {
        // Direct member of sub-vendor
        tree.children.push(node);
      }
    });

    return successResponse(tree);
  } catch (error: any) {
    console.error('Sub-Vendor Network Hierarchy Error:', error);
    return errorResponse(error.message, 500);
  }
}
