import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DynamicForm from '@/models/DynamicForm';
import FormResponse from '@/models/FormResponse';
import User from '@/models/User';
import '@/models/Campaign';
import '@/models/Group';
import '@/models/WomenMember';
import '@/models/FormReport';
import { getAuthSession } from '@/lib/auth';
import { getRegionalUserIds } from '@/utils/authHelpers';
import { exportToCsv, exportToExcel, getStyledHtmlReport, escapeXml } from '@/utils/reportExporter';
import { generatePdfBuffer } from '@/utils/pdfGenerator';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession() as any;
    if (!session || (session.role !== 'super_admin' && !(session.role === 'staff' && session.permissions?.includes('forms.export')))) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // 'csv' | 'excel' | 'pdf'

    await connectDB();

    const form = await DynamicForm.findById(id).lean() as any;
    if (!form) {
      return NextResponse.json({ success: false, message: 'Form not found' }, { status: 404 });
    }

    // Check regional boundaries
    const regionalUserIds = await getRegionalUserIds(session);
    const versionToCheck = form.version || 1;
    const query: any = {
      formId: form._id
    };

    if (versionToCheck === 1) {
      query.$or = [
        { formVersion: 1 },
        { formVersion: { $exists: false } },
        { formVersion: null }
      ];
    } else {
      query.formVersion = versionToCheck;
    }

    if (regionalUserIds !== null) {
      query.userId = { $in: regionalUserIds.map(uid => new mongoose.Types.ObjectId(uid.toString())) };
    }

    // Populate userId to get profile details
    const submissions = await FormResponse.find(query)
      .populate('userId', 'fullName mobile role')
      .sort({ createdAt: -1 })
      .lean();

    // Collect all dynamic fields
    const formFields: any[] = [];
    for (const step of form.steps || []) {
      for (const field of step.fields || []) {
        formFields.push(field);
      }
    }

    // Format fields map as header lists
    const primaryFields = ['DATE SUBMITTED', 'SUBMISSION STATUS', 'SUBMITTER NAME', 'SUBMITTER MOBILE', 'SUBMITTER ROLE'];
    const dynamicFields = formFields.map(f => f.label.toUpperCase());
    const selectedFields = [...primaryFields, ...dynamicFields];

    // Pre-map records for compatibility with reportExporter
    const records = submissions.map((sub: any) => {
      const row: any = {
        'DATE SUBMITTED': new Date(sub.createdAt).toLocaleString('en-IN'),
        'SUBMISSION STATUS': sub.status || 'Submitted',
        'SUBMITTER NAME': sub.userId?.fullName || 'Anonymous',
        'SUBMITTER MOBILE': sub.userId?.mobile || '-',
        'SUBMITTER ROLE': sub.userId?.role?.toUpperCase() || 'ANONYMOUS'
      };

      formFields.forEach(field => {
        const val = sub.responses?.[field.fieldId];
        const key = field.label.toUpperCase();
        if (val === undefined || val === null) {
          row[key] = '';
        } else if (Array.isArray(val)) {
          row[key] = val.join(', ');
        } else {
          row[key] = String(val);
        }
      });

      return row;
    });

    const reportId = 'FRM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const fileName = `export_${form.slug}_v${form.version || 1}_${Date.now()}.${format === 'excel' ? 'xls' : format}`;

    // Save report generation to history log
    try {
      const FormReport = (await import('@/models/FormReport')).default;
      await FormReport.create({
        formId: form._id,
        formVersion: versionToCheck,
        reportType: format,
        generatedBy: new mongoose.Types.ObjectId(session.id),
        fileUrl: `/api/admin/forms/${id}/export?format=${format}`
      });
    } catch (logErr) {
      console.error('[REPORT-LOG-FAIL]', logErr);
    }

    if (format === 'csv') {
      const csvData = exportToCsv(records, selectedFields);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }

    if (format === 'excel') {
      const excelXml = exportToExcel(records, selectedFields, 'Submissions', {
        startDate: null,
        endDate: null,
        status: ['Submitted', 'Reviewed', 'Rejected']
      });
      return new NextResponse(excelXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }

    if (format === 'pdf') {
      // Build visual PDF content
      let tableRows = '';
      records.forEach((row, idx) => {
        tableRows += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td>${escapeXml(row['DATE SUBMITTED'])}</td>
            <td>${escapeXml(row['SUBMITTER NAME'])}</td>
            <td>${escapeXml(row['SUBMISSION STATUS'])}</td>
            ${formFields.map(f => `<td>${escapeXml(row[f.label.toUpperCase()])}</td>`).join('')}
          </tr>
        `;
      });

      const tableHtml = `
        <div class="info-block" style="margin-bottom: 25px;">
          <h3>Form Information</h3>
          <div class="info-row"><span class="label">Form Title:</span><span class="value">${escapeXml(form.title)}</span></div>
          <div class="info-row"><span class="label">Version:</span><span class="value">v${form.version}</span></div>
          <div class="info-row"><span class="label">Description:</span><span class="value">${escapeXml(form.description || 'N/A')}</span></div>
          <div class="info-row"><span class="label">Total Exported Responses:</span><span class="value">${records.length}</span></div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date Submitted</th>
              <th>Submitter Name</th>
              <th>Status</th>
              ${formFields.map(f => `<th>${escapeXml(f.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="4" style="text-align: center;">No responses found.</td></tr>'}
          </tbody>
        </table>
      `;

      const htmlContent = getStyledHtmlReport(tableHtml, `${form.title} - Submission Report`, reportId);
      const pdfBuffer = await generatePdfBuffer(htmlContent, reportId);
      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid format' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
