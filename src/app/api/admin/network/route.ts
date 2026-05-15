import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();

    // 1. Fetch only ACTIVE/APPROVED operational records
    const operationalStatuses = ['active', 'approved'];

    const vendors = await User.find({
      role: 'vendor',
      status: { $in: operationalStatuses }
    }).select('fullName vendorCode role mobile status district block');

    const subVendors = await User.find({
      role: 'sub_vendor',
      status: { $in: operationalStatuses }
    }).select('fullName subVendorCode role mobile status district block parentVendorId');

    const employees = await User.find({
      role: 'employee',
      status: { $in: operationalStatuses }
    }).select('fullName employeeId role mobile status district block parentVendorId');

    const members = await WomenMember.find({
      accountStatus: 'active'
    }).select('name mobile village status membershipStatus assignedEmployeeId subVendorCode vendorCode');

    // 2. Build the Root
    const root: any = {
      id: 'root',
      name: 'SakhiHub Network',
      code: 'ROOT',
      role: 'admin',
      children: []
    };

    // 3. Build Node Map for O(1) lookup--
    const nodeMap: Record<string, any> = { 'root': root };

    // Helper maps for code-based lookups (for members who might have loose code references)
    const subVendorCodeMap: Record<string, string> = {};
    const vendorCodeMap: Record<string, string> = {};

    // 4. Initialize Vendors (Primary level)
    vendors.forEach(v => {
      const id = v._id.toString();
      const node = {
        id,
        name: v.fullName,
        code: v.vendorCode,
        role: 'vendor',
        mobile: v.mobile,
        status: v.status,
        location: `${v.block || ''}, ${v.district || ''}`,
        children: []
      };
      nodeMap[id] = node;
      if (v.vendorCode) vendorCodeMap[v.vendorCode] = id;
      root.children.push(node);
    });

    // 5. Nest Sub-vendors
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
        children: []
      };
      nodeMap[id] = node;
      if (sv.subVendorCode) subVendorCodeMap[sv.subVendorCode] = id;

      const parentId = sv.parentVendorId?.toString();
      if (parentId && nodeMap[parentId]) {
        nodeMap[parentId].children.push(node);
      }
      // Note: Orphans (Sub-vendors with missing/inactive parents) are excluded from the tree
    });

    // 6. Nest Employees
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
        children: []
      };
      nodeMap[id] = node;

      const parentId = emp.parentVendorId?.toString();
      if (parentId && nodeMap[parentId]) {
        nodeMap[parentId].children.push(node);
      }
      // Employees without active parents are excluded
    });

    // 7. Nest Members (Strict placement)
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

      // Hierarchy Priority: Employee -> Sub-Vendor -> Vendor
      if (m.assignedEmployeeId && nodeMap[m.assignedEmployeeId.toString()]) {
        nodeMap[m.assignedEmployeeId.toString()].children.push(node);
      } else if (m.subVendorCode && subVendorCodeMap[m.subVendorCode]) {
        const svId = subVendorCodeMap[m.subVendorCode];
        if (nodeMap[svId]) nodeMap[svId].children.push(node);
      } else if (m.vendorCode && vendorCodeMap[m.vendorCode]) {
        const vId = vendorCodeMap[m.vendorCode];
        if (nodeMap[vId]) nodeMap[vId].children.push(node);
      }
      // Members without a valid/active parent link are excluded
    });

    return successResponse(root);
  } catch (error: any) {
    console.error('Admin Network Hierarchy Error:', error);
    return errorResponse(error.message, 500);
  }
}
