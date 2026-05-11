import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { sendEmail } from '@/lib/email';
import { getWelcomeTemplate } from '@/lib/emailTemplates';
import EmailLog from '@/models/EmailLog';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return errorResponse('Unauthorized', 403);
    }

    const { status, employeeId, designation, block, area } = await req.json();
    await dbConnect();

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return errorResponse('User not found', 404);
    }

    // Strict Hierarchy Validation (Option C enforcement)
    if (status === 'active' && userToUpdate.assignmentStatus === 'pending' && !['super_admin', 'vendor'].includes(userToUpdate.role)) {
      return errorResponse('Hierarchy Mapping Required. User must be assigned to a parent role/campaign before activation.', 400);
    }

    const updateData: any = { status };
    if (employeeId) updateData.employeeId = employeeId;
    if (designation) updateData.designation = designation;
    if (block) updateData.block = block;
    if (area) updateData.area = area;

    // Only generate employeeId for field staff (employees)
    if (status === 'active' && userToUpdate.role === 'employee' && !userToUpdate.employeeId && !employeeId) {
       const count = await User.countDocuments({ role: 'employee' });
       updateData.employeeId = `SKH-${new Date().getFullYear()}-${1000 + count}`;
    }

    const user = await User.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

    if (!user) {
      return errorResponse('Employee not found', 404);
    }

    // Send Welcome Email if activated and not already sent
    if (status === 'active' && user.email && !user.welcomeEmailSent) {
      const welcomeHtml = getWelcomeTemplate(user.fullName, user.role, false);
      sendEmail(user.email, 'Welcome to SakhiHub!', welcomeHtml).then(async (res) => {
        if (res.success) {
          await User.findByIdAndUpdate(user._id, { welcomeEmailSent: true });
        }
        
        await EmailLog.create({
          recipient: user.email!,
          subject: 'Welcome to SakhiHub!',
          type: 'welcome_email_admin_approval',
          status: res.success ? 'success' : 'failed',
          error: res.success ? undefined : (res.error as any)?.message,
          relatedId: user._id
        });
      });
    }

    return successResponse(user, `Employee status updated to ${status}`);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
