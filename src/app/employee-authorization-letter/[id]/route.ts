import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import AuthorizationLetter from '@/models/AuthorizationLetter';
import { getAuthSession } from '@/lib/auth';
import { generateAuthorizationLetterHtml } from '@/utils/authorizationLetterGenerator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // 1. Fetch user (employee) details
    const user = await User.findById(id).lean() as any;
    if (!user) {
      return new Response('Employee not found', { status: 404 });
    }

    // 2. Fetch active authorization letter
    const letter = await AuthorizationLetter.findOne({ userId: user._id, status: 'active' }).lean() as any;
    if (!letter) {
      return new Response('No active authorization letter found for this employee', { status: 404 });
    }

    // 3. Security/Session checks
    const session = await getAuthSession() as any;
    if (!session) {
      return new Response('Unauthorized: Please log in.', { status: 401 });
    }

    // Allow Super Admin, Admin, or the employee themselves
    if (session.role !== 'super_admin' && session.role !== 'admin' && session.id !== user._id.toString()) {
      return new Response('Forbidden: Insufficient permissions to view this letter', { status: 403 });
    }

    const verificationUrl = `https://sakhihub.com/verify/authorization/${letter._id}`;
    const isDCDesignation = ['District Coordinator', 'District Project Officer'].includes(user.designation || '');

    const htmlContent = generateAuthorizationLetterHtml({
      employeeName: user.fullName,
      employeeId: user.employeeId || 'PENDING',
      designation: user.designation || 'Representative',
      state: letter.state,
      district: letter.district,
      block: isDCDesignation ? undefined : (letter.block || undefined),
      authorizationNumber: letter.authorizationNumber,
      issueDate: letter.issueDate,
      validUntil: letter.validUntil,
      verificationUrl
    });

    // 4. Inject a floating print button at the top that is hidden in print mode
    const finalHtml = htmlContent.replace(
      '</body>',
      `
      <div class="print-btn-container" style="position: fixed; top: 15px; right: 20px; z-index: 10000; font-family: system-ui, sans-serif;">
        <button onclick="window.print()" style="background-color: #6A1B9A; color: white; border: none; padding: 10px 22px; border-radius: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 14px rgba(106, 27, 154, 0.3); font-size: 13px; display: flex; align-items: center; gap: 8px; transition: transform 0.1s ease;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print / Save as PDF
        </button>
      </div>
      <style>
        @media print {
          .print-btn-container {
            display: none !important;
          }
        }
      </style>
      </body>
      `
    );

    return new Response(finalHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: any) {
    console.error('Fetch Letter HTML Error:', error);
    return new Response(`Failed to fetch preview: ${error.message || error}`, { status: 500 });
  }
}
