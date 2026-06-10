import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Fetch a larger batch by default
    const skip = (page - 1) * limit;

    const total = await EmailTemplate.countDocuments({});
    
    // Sort custom templates first, then by name
    const templates = await EmailTemplate.find({})
      .populate('createdBy', 'fullName')
      .sort({ isSystem: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('[TEMPLATES_API_GET] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    await dbConnect();
    const body = await req.json();
    const { name, subject, content, description } = body;

    if (!name || !subject || !content) {
      return errorResponse('Name, subject, and content are required.', 400);
    }

    // Check unique name
    const existing = await EmailTemplate.findOne({ name });
    if (existing) {
      return errorResponse('A template with this name already exists.', 400);
    }

    const template = await EmailTemplate.create({
      name,
      subject,
      content,
      description,
      isSystem: false,
      createdBy: session.id
    });

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await logActivity('create_template', session.id, undefined, ipAddress, {
      templateId: template._id,
      name: template.name
    });

    return successResponse(template, 'Template created successfully', 201);
  } catch (error: any) {
    console.error('[TEMPLATES_API_POST] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
