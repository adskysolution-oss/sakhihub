import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CoreTeamMember from '@/models/CoreTeamMember';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { uploadFile } from '@/lib/storage';
import { signMediaUrl } from '@/lib/s3';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const members = await CoreTeamMember.find().sort({ priority: 1, createdAt: -1 });
    const signedMembers = await Promise.all(members.map(async (member) => {
      const memberObj = member.toObject();
      if (memberObj.photo) {
        memberObj.photo = await signMediaUrl(memberObj.photo);
      }
      return memberObj;
    }));
    return successResponse(signedMembers);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const body = await req.json();

    // Handle image upload if provided as base64
    if (body.photo && body.photo.startsWith('data:')) {
      try {
        const uploadRes = await uploadFile(body.photo, 'team', { uploadedFor: 'coreTeamPhoto' });
        body.photo = uploadRes.url;
      } catch (uploadErr: any) {
        console.error('Failed to upload core team photo:', uploadErr);
        return errorResponse('Image upload failed: ' + (uploadErr.message || ''), 400);
      }
    }

    // Strip query parameters if the photo is an S3 URL with pre-signed params
    if (body.photo && body.photo.includes('.amazonaws.com/') && body.photo.includes('?')) {
      body.photo = body.photo.split('?')[0];
    }

    let member;
    if (body._id) {
      member = await CoreTeamMember.findByIdAndUpdate(body._id, body, { new: true, runValidators: true });
      if (!member) return errorResponse('Core team member not found', 404);
    } else {
      member = await CoreTeamMember.create(body);
    }

    return successResponse(member, body._id ? 'Member updated successfully' : 'Member created successfully');
  } catch (error: any) {
    console.error('Admin Core Team API POST Error:', error);
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return errorResponse('ID parameter is required', 400);

    await dbConnect();
    const member = await CoreTeamMember.findByIdAndDelete(id);
    if (!member) return errorResponse('Member not found', 404);

    return successResponse(null, 'Member deleted successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
