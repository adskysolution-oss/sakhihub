import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/utils/response';
import { maskPublicId } from '@/utils/mask';
import { ORGANIZATION_PROFILE } from '@/constants/organization';
import CoreTeamMember from '@/models/CoreTeamMember';
import { signMediaUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Fetch dynamic core team members
    let coreTeamMembers = [];
    try {
      coreTeamMembers = await CoreTeamMember.find({ isPublicVisible: true }).sort({ priority: 1 });
    } catch (dbErr) {
      console.error('Failed to fetch CoreTeamMember documents:', dbErr);
    }

    // 1. Fetch active, approved, and public-visible users with team roles
    const users = await User.find({
      role: { $in: ['vendor', 'sub_vendor', 'staff', 'employee'] },
      status: { $in: ['active', 'approved'] },
      isPublicVisible: { $ne: false }
    }).select('fullName profileImage role employeeId vendorCode subVendorCode parentVendorId reportingManager district state joiningDate createdAt');

    // 2. Map database users to helper map
    const userMap = new Map<string, any>();
    users.forEach(u => {
      const id = u._id.toString();
      
      let rawCode = u.employeeId;
      if (u.role === 'vendor') rawCode = u.vendorCode;
      else if (u.role === 'sub_vendor') rawCode = u.subVendorCode;

      if (!rawCode) {
        rawCode = `${u.role.substring(0, 3).toUpperCase()}-${id.substring(id.length - 6)}`;
      }

      userMap.set(id, {
        userId: id,
        name: u.fullName,
        photo: u.profileImage || '',
        role: u.role,
        employeeId: rawCode,
        rawParentId: u.parentVendorId?.toString() || u.reportingManager?.toString() || null,
        district: u.district || '',
        state: u.state || '',
        joiningDate: u.joiningDate || u.createdAt || new Date()
      });
    });

    // 3. Dynamic level calculation starting at Level 2 for database roots (Founder is Level 1)
    const levelMemo = new Map<string, number>();
    const visited = new Set<string>();

    function calculateLevel(userId: string): number {
      if (levelMemo.has(userId)) return levelMemo.get(userId)!;
      if (visited.has(userId)) return 2; // Cycle guard: default to top-level if loop detected

      const u = userMap.get(userId);
      if (!u || !u.rawParentId || !userMap.has(u.rawParentId)) {
        levelMemo.set(userId, 2);
        return 2;
      }

      visited.add(userId);
      const parentLevel = calculateLevel(u.rawParentId);
      visited.delete(userId);

      const resolved = parentLevel + 1;
      levelMemo.set(userId, resolved);
      return resolved;
    }

    // 4. Resolve core team members separately
    const resolvedCoreMembers: any[] = [];
    if (coreTeamMembers && coreTeamMembers.length > 0) {
      for (const member of coreTeamMembers) {
        const signedPhoto = member.photo ? await signMediaUrl(member.photo) : '';
        resolvedCoreMembers.push({
          userId: member._id.toString(),
          name: member.name,
          photo: signedPhoto,
          role: member.role, // e.g. "founder", "project_leader", "trainer"
          designation: member.designation || '',
          employeeId: member.employeeId ? maskPublicId(member.employeeId) : '',
          parent: null,
          district: member.district || '',
          state: member.state || '',
          joiningDate: member.joiningDate || member.createdAt,
          bio: member.bio || '',
          message: member.message || '',
          level: 1,
          priority: member.priority
        });
      }
    } else {
      // Fallback static founder
      resolvedCoreMembers.push({
        userId: 'founder_root',
        name: ORGANIZATION_PROFILE.founderName,
        photo: ORGANIZATION_PROFILE.founderPhoto,
        role: 'founder',
        designation: ORGANIZATION_PROFILE.founderDesignation,
        employeeId: maskPublicId('FDR0000010000'),
        parent: null,
        district: ORGANIZATION_PROFILE.founderDistrict,
        state: ORGANIZATION_PROFILE.founderState,
        joiningDate: new Date(`${ORGANIZATION_PROFILE.founderSince}-01-01`),
        bio: ORGANIZATION_PROFILE.founderBio,
        level: 1,
        priority: 1
      });
    }

    // 5. Construct DB Users list
    const resolvedUsers: any[] = [];
    for (const [id, u] of userMap.entries()) {
      const level = calculateLevel(id);
      const parentUser = u.rawParentId ? userMap.get(u.rawParentId) : null;
      const signedPhoto = u.photo ? await signMediaUrl(u.photo) : '';

      resolvedUsers.push({
        userId: id,
        name: u.name,
        photo: signedPhoto,
        role: u.role,
        employeeId: maskPublicId(u.employeeId),
        parent: parentUser ? {
          id: maskPublicId(parentUser.employeeId),
          name: parentUser.name,
          role: parentUser.role
        } : null,
        district: u.district,
        state: u.state,
        joiningDate: u.joiningDate,
        level: level
      });
    }

    // 5. Apply Filter Logic (In-Memory)
    // Permanently filter out users who do not have a profile photo set
    let filtered = resolvedUsers.filter(u => u.photo && u.photo.trim() !== '');
    let filteredCore = [...resolvedCoreMembers];
    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get('search')?.toLowerCase().trim();
    const role = searchParams.get('role');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const level = searchParams.get('level');

    if (search) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.employeeId.toLowerCase().includes(search) ||
        u.district.toLowerCase().includes(search) ||
        u.state.toLowerCase().includes(search) ||
        (u.parent && u.parent.name.toLowerCase().includes(search))
      );
    }

    if (role && role !== 'all') {
      filtered = filtered.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }

    if (state && state !== 'all') {
      filtered = filtered.filter(u => u.state.toLowerCase() === state.toLowerCase());
    }

    if (district && district !== 'all') {
      filtered = filtered.filter(u => u.district.toLowerCase() === district.toLowerCase());
    }

    if (level && level !== 'all') {
      filtered = filtered.filter(u => u.level === parseInt(level));
    }

    // 6. Paginate Results
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const paginatedUsers = filtered.slice(skip, skip + limit);
    const pagination = {
      page,
      limit,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit)
    };

    return successResponse({
      coreMembers: filteredCore,
      users: paginatedUsers,
      pagination
    });
  } catch (error: any) {
    console.error('Public Team Members API Error:', error);
    return errorResponse(error.message || 'Failed to fetch team members', 500);
  }
}
