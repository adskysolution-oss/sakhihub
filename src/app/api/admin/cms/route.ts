import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Content from '@/models/Content';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    await dbConnect();
    const contents = await Content.find().sort({ category: 1, key: 1 });
    return successResponse(contents);
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
    const content = await Content.findOneAndUpdate(
      { key: body.key },
      { ...body, updatedBy: (session as any).id },
      { upsert: true, new: true }
    );
    return successResponse(content, 'Content updated successfully');
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
