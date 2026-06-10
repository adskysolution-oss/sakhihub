import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import User from '@/models/User';
import { getAuthSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/utils/response';
import { EmailService } from '@/lib/email';
import { resolveMergeTags } from '@/lib/queue';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession() as any;
    if (!session || session.role !== 'super_admin') {
      return errorResponse('Unauthorized. Super Admin access required.', 403);
    }

    const { id } = await props.params;
    await dbConnect();

    const { testEmail } = await req.json();
    if (!testEmail) {
      return errorResponse('Test email address is required.', 400);
    }

    const campaign = await EmailCampaign.findById(id);
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Resolve variables using active admin's user details (or mock)
    const adminUser = await User.findById(session.id).lean() || {
      fullName: 'Test Admin',
      email: testEmail,
      mobile: '9999999999',
      role: 'super_admin',
      designation: 'Super Administrator',
      joiningDate: new Date()
    };

    const customizedContent = resolveMergeTags(campaign.content, adminUser);
    const customizedSubject = `[TEST] ${resolveMergeTags(campaign.subject, adminUser)}`;

    console.log(`[TEST-EMAIL] Sending test campaign email to: ${testEmail}`);
    const result = await EmailService.send(
      testEmail,
      customizedSubject,
      customizedContent,
      campaign.attachments?.map((att: any) => ({
        filename: att.filename,
        content: att.url
      }))
    );

    if (result.success) {
      return successResponse({ message: 'Test email sent successfully' });
    } else {
      return errorResponse(result.error || 'Failed to send test email', 500);
    }

  } catch (error: any) {
    console.error('[CAMPAIGN_TEST_API] Error:', error);
    return errorResponse(error.message || 'Server Error', 500);
  }
}
