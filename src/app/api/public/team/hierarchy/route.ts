import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/utils/response';
import { maskPublicId } from '@/utils/mask';
import { ORGANIZATION_PROFILE } from '@/constants/organization';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Fetch active, approved, public-visible users
    const users = await User.find({
      role: { $in: ['vendor', 'sub_vendor', 'staff', 'employee'] },
      status: { $in: ['active', 'approved'] },
      isPublicVisible: { $ne: false }
    }).select('fullName profileImage role employeeId vendorCode subVendorCode parentVendorId reportingManager district state joiningDate createdAt');

    // 2. Initialize Founder Node
    const founderNode: any = {
      userId: 'founder_root',
      name: ORGANIZATION_PROFILE.founderName,
      photo: ORGANIZATION_PROFILE.founderPhoto,
      role: 'founder',
      designation: ORGANIZATION_PROFILE.founderDesignation,
      employeeId: maskPublicId('FDR0000010000'), // Yields FDR000001****
      parent: null,
      district: ORGANIZATION_PROFILE.founderDistrict,
      state: ORGANIZATION_PROFILE.founderState,
      joiningDate: new Date(`${ORGANIZATION_PROFILE.founderSince}-01-01`),
      bio: ORGANIZATION_PROFILE.founderBio,
      children: []
    };

    // 3. Create tree nodes map
    const nodeMap = new Map<string, any>();
    users.forEach(u => {
      const id = u._id.toString();
      let code = u.employeeId;
      if (u.role === 'vendor') code = u.vendorCode;
      else if (u.role === 'sub_vendor') code = u.subVendorCode;

      if (!code) {
        code = `${u.role.substring(0, 3).toUpperCase()}-${id.substring(id.length - 6)}`;
      }

      nodeMap.set(id, {
        userId: id,
        name: u.fullName,
        photo: u.profileImage || '',
        role: u.role,
        employeeId: maskPublicId(code),
        rawParentId: u.parentVendorId?.toString() || u.reportingManager?.toString() || null,
        district: u.district || '',
        state: u.state || '',
        joiningDate: u.joiningDate || u.createdAt || new Date(),
        parent: null,
        children: []
      });
    });

    // 4. Build parent-child relationships in the tree
    nodeMap.forEach((node, id) => {
      const pId = node.rawParentId;
      if (pId && nodeMap.has(pId)) {
        const parentNode = nodeMap.get(pId);
        node.parent = {
          id: parentNode.employeeId,
          name: parentNode.name,
          role: parentNode.role
        };
        parentNode.children.push(node);
      } else {
        // Root database node: Reports to none, so visually branches from Founder
        node.parent = null; // Stays null as per rule 5 (no fabricated parents in card details)
        founderNode.children.push(node);
      }
    });

    // 5. Recursively compute levels down the tree
    function assignLevels(node: any, level: number) {
      node.level = level;
      node.children.forEach((child: any) => {
        assignLevels(child, level + 1);
      });
    }

    assignLevels(founderNode, 1);

    return successResponse(founderNode);
  } catch (error: any) {
    console.error('Public Team Hierarchy API Error:', error);
    return errorResponse(error.message || 'Failed to fetch team hierarchy', 500);
  }
}
