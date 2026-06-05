import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
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

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId') || 'root';
    const operationalStatuses = ['active', 'approved'];

    let nodes: any[] = [];

    if (parentId === 'root') {
      // Fetch top-level Vendors
      const vendors = await User.find({
        role: 'vendor',
        status: { $in: operationalStatuses }
      })
      .select('fullName vendorCode role mobile status district block profileImage createdAt')
      .sort({ createdAt: -1 })
      .lean();

      // Compute counts for each Vendor
      nodes = await Promise.all(
        vendors.map(async (v: any) => {
          const vId = v._id;
          const svIds = await User.find({
            role: 'sub_vendor',
            parentVendorId: vId,
            status: { $in: operationalStatuses }
          }).distinct('_id');

          const empIds = await User.find({
            role: 'employee',
            parentVendorId: { $in: [vId, ...svIds] },
            status: { $in: operationalStatuses }
          }).distinct('_id');

          const svCodes = await User.find({ _id: { $in: svIds } }).distinct('subVendorCode');

          const memCount = await WomenMember.countDocuments({
            accountStatus: 'active',
            $or: [
              { assignedEmployeeId: { $in: empIds } },
              { subVendorCode: { $in: svCodes } },
              { vendorCode: v.vendorCode }
            ]
          });

          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const hasRisk = (svIds.length === 0) || 
            (v.status === 'pending' && new Date(v.createdAt) < thirtyDaysAgo) ||
            (v.status === 'reupload_required');

          return {
            id: vId.toString(),
            name: v.fullName,
            code: v.vendorCode,
            role: 'vendor',
            mobile: v.mobile,
            status: v.status,
            location: `${v.block || ''}, ${v.district || ''}`,
            profileImage: v.profileImage,
            createdAt: v.createdAt,
            counts: {
              subVendors: svIds.length,
              employees: empIds.length,
              members: memCount
            },
            hasChildren: svIds.length > 0 || empIds.length > 0 || memCount > 0,
            hasRisk
          };
        })
      );
    } else {
      const parentObjectId = new mongoose.Types.ObjectId(parentId);
      const parentUser = await User.findById(parentObjectId).select('role vendorCode subVendorCode employeeId').lean();

      if (parentUser) {
        if (parentUser.role === 'vendor') {
          // A Vendor can have Sub-vendors and direct Employees
          const subVendors = await User.find({
            role: 'sub_vendor',
            parentVendorId: parentObjectId,
            status: { $in: operationalStatuses }
          }).select('fullName subVendorCode role mobile status district block profileImage createdAt').lean();

          const directEmployees = await User.find({
            role: 'employee',
            parentVendorId: parentObjectId,
            status: { $in: operationalStatuses }
          }).select('fullName employeeId role mobile status district block profileImage createdAt paymentCompleted subscriptionPaid').lean();

          // Map Sub-vendors
          const svNodes = await Promise.all(
            subVendors.map(async (sv: any) => {
              const svId = sv._id;
              const empIds = await User.find({
                role: 'employee',
                parentVendorId: svId,
                status: { $in: operationalStatuses }
              }).distinct('_id');

              const memCount = await WomenMember.countDocuments({
                accountStatus: 'active',
                $or: [
                  { assignedEmployeeId: { $in: empIds } },
                  { subVendorCode: sv.subVendorCode }
                ]
              });

              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const hasRisk = (empIds.length === 0) ||
                (sv.status === 'pending' && new Date(sv.createdAt) < thirtyDaysAgo) ||
                (sv.status === 'reupload_required');

              return {
                id: svId.toString(),
                name: sv.fullName,
                code: sv.subVendorCode,
                role: 'sub_vendor',
                mobile: sv.mobile,
                status: sv.status,
                location: `${sv.block || ''}, ${sv.district || ''}`,
                profileImage: sv.profileImage,
                createdAt: sv.createdAt,
                counts: {
                  subVendors: 0,
                  employees: empIds.length,
                  members: memCount
                },
                hasChildren: empIds.length > 0 || memCount > 0,
                hasRisk
              };
            })
          );

          // Map Employees
          const empNodes = await Promise.all(
            directEmployees.map(async (emp: any) => {
              const empId = emp._id;
              const memCount = await WomenMember.countDocuments({
                accountStatus: 'active',
                assignedEmployeeId: empId
              });

              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const hasRisk = (memCount === 0) ||
                (emp.status === 'pending' && new Date(emp.createdAt) < thirtyDaysAgo) ||
                (emp.status === 'reupload_required') ||
                (!emp.paymentCompleted && !emp.subscriptionPaid);

              return {
                id: empId.toString(),
                name: emp.fullName,
                code: emp.employeeId,
                role: 'employee',
                mobile: emp.mobile,
                status: emp.status,
                location: `${emp.block || ''}, ${emp.district || ''}`,
                profileImage: emp.profileImage,
                createdAt: emp.createdAt,
                counts: {
                  subVendors: 0,
                  employees: 0,
                  members: memCount
                },
                hasChildren: memCount > 0,
                hasRisk
              };
            })
          );

          nodes = [...svNodes, ...empNodes];
        } else if (parentUser.role === 'sub_vendor') {
          // A Sub-vendor has Employees
          const employees = await User.find({
            role: 'employee',
            parentVendorId: parentObjectId,
            status: { $in: operationalStatuses }
          }).select('fullName employeeId role mobile status district block profileImage createdAt paymentCompleted subscriptionPaid').lean();

          nodes = await Promise.all(
            employees.map(async (emp: any) => {
              const empId = emp._id;
              const memCount = await WomenMember.countDocuments({
                accountStatus: 'active',
                assignedEmployeeId: empId
              });

              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              const hasRisk = (memCount === 0) ||
                (emp.status === 'pending' && new Date(emp.createdAt) < thirtyDaysAgo) ||
                (emp.status === 'reupload_required') ||
                (!emp.paymentCompleted && !emp.subscriptionPaid);

              return {
                id: empId.toString(),
                name: emp.fullName,
                code: emp.employeeId,
                role: 'employee',
                mobile: emp.mobile,
                status: emp.status,
                location: `${emp.block || ''}, ${emp.district || ''}`,
                profileImage: emp.profileImage,
                createdAt: emp.createdAt,
                counts: {
                  subVendors: 0,
                  employees: 0,
                  members: memCount
                },
                hasChildren: memCount > 0,
                hasRisk
              };
            })
          );
        } else if (parentUser.role === 'employee') {
          // An Employee has Members
          const members = await WomenMember.find({
            accountStatus: 'active',
            assignedEmployeeId: parentObjectId
          }).select('name mobile village status connectionStatus membershipStatus createdAt').lean();

          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          nodes = members.map((m: any) => {
            const hasRisk = (m.connectionStatus === 'pending_request' && new Date(m.createdAt) < thirtyDaysAgo) ||
              (m.status === 'reupload_required');

            return {
              id: m._id.toString(),
              name: m.name,
              code: m.mobile,
              role: 'member',
              mobile: m.mobile,
              status: m.membershipStatus,
              location: m.village,
              createdAt: m.createdAt,
              counts: {
                subVendors: 0,
                employees: 0,
                members: 0
              },
              hasChildren: false,
              hasRisk
            };
          });
        }
      }
    }

    return successResponse(nodes);
  } catch (error: any) {
    console.error('Lazy Assembly Error:', error);
    return errorResponse(error.message, 500);
  }
}
