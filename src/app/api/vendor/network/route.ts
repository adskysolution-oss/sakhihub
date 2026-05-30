import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'vendor') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const vendorId = (session as any).id;
    
    // 1. Fetch only ACTIVE/APPROVED operational records
    const operationalStatuses = ['active', 'approved'];

    const vendor = await User.findOne({ 
      _id: vendorId,
      status: { $in: operationalStatuses } 
    }).select('fullName vendorCode role mobile profileImage');

    if (!vendor) return errorResponse('Active vendor record not found', 404);

    // 2. Fetch downstream network
    const subVendors = await User.find({ 
      parentVendorId: vendorId, 
      role: 'sub_vendor',
      status: { $in: operationalStatuses } 
    }).select('fullName subVendorCode role mobile status district block profileImage');

    const subVendorIds = subVendors.map(sv => sv._id);
    const subVendorCodes = subVendors.map(sv => sv.subVendorCode).filter(Boolean);

    const employees = await User.find({
      role: 'employee',
      status: { $in: operationalStatuses },
      $or: [
        { parentVendorId: vendorId },
        { parentVendorId: { $in: subVendorIds } }
      ]
    }).select('fullName employeeId role mobile status district block parentVendorId profileImage');

    const employeeIds = employees.map(emp => emp._id);

    const members = await WomenMember.find({
      accountStatus: 'active',
      $or: [
        { vendorCode: vendor.vendorCode },
        { subVendorCode: { $in: subVendorCodes } },
        { assignedEmployeeId: { $in: employeeIds } }
      ]
    }).select('name mobile village status membershipStatus assignedEmployeeId subVendorCode vendorCode');

    // 3. Build Hierarchy Tree
    const tree: any = {
      id: vendor._id.toString(),
      name: vendor.fullName,
      code: vendor.vendorCode,
      role: 'vendor',
      mobile: vendor.mobile,
      children: []
    };

    const nodeMap: Record<string, any> = {};
    nodeMap[vendor._id.toString()] = tree;

    // Helper map for sub-vendor code lookups
    const subVendorCodeMap: Record<string, string> = {};

    // Process Sub-vendors
    subVendors.forEach(sv => {
      const id = sv._id.toString();
      const node = {
        id,
        name: sv.fullName,
        code: sv.subVendorCode,
        role: 'sub_vendor',
        mobile: sv.mobile,
        status: sv.status,
        location: `${sv.block || ''}, ${sv.district || ''}`,
        profileImage: sv.profileImage,
        children: []
      };
      nodeMap[id] = node;
      if (sv.subVendorCode) subVendorCodeMap[sv.subVendorCode] = id;
      tree.children.push(node);
    });

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

      const parentId = emp.parentVendorId?.toString();
      if (parentId && nodeMap[parentId]) {
        nodeMap[parentId].children.push(node);
      } else {
        // Direct employee of vendor
        tree.children.push(node);
      }
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
      } else if (m.subVendorCode && subVendorCodeMap[m.subVendorCode]) {
        const svId = subVendorCodeMap[m.subVendorCode];
        if (nodeMap[svId]) nodeMap[svId].children.push(node);
      } else {
        // Direct member of vendor
        tree.children.push(node);
      }
    });

    return successResponse(tree);
  } catch (error: any) {
    console.error('Vendor Network Hierarchy Error:', error);
    return errorResponse(error.message, 500);
  }
}
