import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WomenMember from '@/models/WomenMember';
import Group from '@/models/Group';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const body = await req.json();
    
    // Auto-populate district and block from group if missing
    const Group = (await import('@/models/Group')).default;
    const group = await Group.findById(body.groupId);
    if (!group) {
      return errorResponse('Associated group not found', 404);
    }

    if (!body.district) body.district = group.district;
    if (!body.block) body.block = group.block;

    const member = await WomenMember.create({
      ...body,
      createdBy: (session as any).id,
      assignedEmployeeId: (session as any).id,
      connectionStatus: 'approved',
      accountStatus: 'active',
      membershipStatus: 'free'
    });

    return successResponse(member, 'Member added successfully', 201);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return errorResponse('Unauthorized', 401);

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const role = (session as any).role;
    const userId = (session as any).id;

    let query: any = {};
    const groupId = searchParams.get('groupId');

    if (role === 'employee') {
      query.$or = [{ createdBy: userId }, { assignedEmployeeId: userId }];
    }

    if (groupId) {
      query.groupId = groupId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await WomenMember.find(query)
      .sort({ createdAt: -1 })
      .populate('groupId', 'groupName village');

    return successResponse(members);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
