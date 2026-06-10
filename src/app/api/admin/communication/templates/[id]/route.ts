import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { logActivity } from '@/utils/authHelpers';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await props.params;
    await dbConnect();
    const body = await req.json();
    const { name, subject, content, description } = body;

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return errorResponse('Template not found', 404);
    }

    // Protect system template names if needed, but allow content editing
    if (template.isSystem && name !== template.name) {
      return errorResponse('Cannot change the name of system-seeded templates.', 400);
    }

    // Check unique name if name changed
    if (name && name !== template.name) {
      const existing = await EmailTemplate.findOne({ name });
      if (existing) {
        return errorResponse('Another template with this name already exists.', 400);
      }
    }

    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.content = content || template.content;
    template.description = description !== undefined ? description : template.description;

    await template.save();

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await logActivity('update_template', session.id, undefined, ipAddress, {
      templateId: template._id,
      name: template.name
    });

    return successResponse(template);
  } catch (error: any) {
    console.error('[TEMPLATE_DETAIL_PUT] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await props.params;
    await dbConnect();

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return errorResponse('Template not found', 404);
    }

    if (template.isSystem) {
      return errorResponse('System-seeded templates are required by the platform and cannot be deleted.', 400);
    }

    await EmailTemplate.findByIdAndDelete(id);

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await logActivity('delete_template', session.id, undefined, ipAddress, {
      templateId: id,
      name: template.name
    });

    return successResponse({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('[TEMPLATE_DETAIL_DELETE] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
