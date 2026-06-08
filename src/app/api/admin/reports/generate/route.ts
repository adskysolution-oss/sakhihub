import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import PaymentTransaction from '@/models/PaymentTransaction';
import ManualPaymentRequest from '@/models/ManualPaymentRequest';
import SecurityDeposit from '@/models/SecurityDeposit';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import VendorAgreement from '@/models/VendorAgreement';
import ReportTemplate from '@/models/ReportTemplate';
import ReportAuditLog from '@/models/ReportAuditLog';
import { getAuthSession } from '@/lib/auth';
import { exportToCsv, exportToExcel, getStyledHtmlReport, escapeXml } from '@/utils/reportExporter';
import { generatePdfBuffer } from '@/utils/pdfGenerator';

export async function POST(req: NextRequest) {
  try {
    const { verifyPermission } = await import('@/utils/authHelpers');
    const { authorized, error, session } = await verifyPermission('reports.export');
    if (!authorized) return error;

    await dbConnect();
    const sessionUser = session as any;
    const currentUserId = sessionUser.id || sessionUser.userId;

    const body = await req.json();
    const {
      entityType,
      startDate,
      endDate,
      status, // Array
      paymentStatus, // Array
      location, // { state, district, block }
      selectedFields, // Array
      format, // 'pdf' | 'excel' | 'csv'
      saveTemplateName
    } = body;

    if (!entityType || !format || !selectedFields || selectedFields.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Optionally save configuration as a template
    if (saveTemplateName) {
      await ReportTemplate.create({
        name: saveTemplateName,
        entityType,
        filters: {
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status,
          paymentStatus,
          location
        },
        selectedFields,
        format,
        createdBy: currentUserId
      });
    }

    // 2. Build Query Filters dynamically
    const queryFilters: any = {};

    if (startDate || endDate) {
      queryFilters.createdAt = {};
      if (startDate) queryFilters.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryFilters.createdAt.$lte = end;
      }
    }

    // Apply Location filters
    if (location) {
      if (location.state) queryFilters.state = location.state;
      if (location.district) queryFilters.district = location.district;
      if (location.block) queryFilters.block = location.block;
    }

    let records: any[] = [];
    const reportId = 'RPT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 3. Query based on Entity Type
    if (['vendors', 'sub_vendors', 'employees'].includes(entityType)) {
      // Role mapping
      const roleMap: Record<string, string> = {
        vendors: 'vendor',
        sub_vendors: 'sub_vendor',
        employees: 'employee'
      };
      queryFilters.role = roleMap[entityType];

      // Status filters
      if (status && status.length > 0) {
        queryFilters.status = { $in: status };
      }

      // PaymentStatus filters
      if (paymentStatus && paymentStatus.length > 0) {
        const matchPaid = paymentStatus.includes('Paid');
        const matchUnpaid = paymentStatus.includes('Unpaid');
        if (matchPaid && !matchUnpaid) {
          queryFilters.paymentCompleted = true;
        } else if (matchUnpaid && !matchPaid) {
          queryFilters.paymentCompleted = { $ne: true };
        }
      }

      // Fetch Users & Populate parents
      const users = await User.find(queryFilters)
        .populate({
          path: 'parentVendorId',
          select: 'fullName role vendorCode subVendorCode',
          populate: {
            path: 'parentVendorId',
            select: 'fullName vendorCode'
          }
        })
        .sort({ createdAt: -1 })
        .lean();

      // Flatten nested properties for clean column representation
      records = users.map((u: any) => {
        let parentVendorName = 'N/A';
        let parentSubVendorName = 'N/A';

        if (u.parentVendorId) {
          if (u.parentVendorId.role === 'vendor') {
            parentVendorName = u.parentVendorId.fullName;
          } else if (u.parentVendorId.role === 'sub_vendor') {
            parentSubVendorName = u.parentVendorId.fullName;
            if (u.parentVendorId.parentVendorId) {
              parentVendorName = u.parentVendorId.parentVendorId.fullName;
            }
          }
        }

        return {
          ...u,
          id: u._id.toString(),
          paymentStatus: u.paymentCompleted ? 'Paid' : 'Unpaid',
          parentVendorName,
          parentSubVendorName,
          createdAt: new Date(u.createdAt).toLocaleDateString('en-IN')
        };
      });

    } else if (entityType === 'members') {
      // Members list
      if (status && status.length > 0) {
        queryFilters.connectionStatus = { $in: status };
      }
      if (paymentStatus && paymentStatus.length > 0) {
        const mappedStatuses: string[] = [];
        if (paymentStatus.includes('Paid') || paymentStatus.includes('paid')) {
          mappedStatuses.push('paid');
        }
        if (paymentStatus.includes('Unpaid') || paymentStatus.includes('unpaid')) {
          mappedStatuses.push('free', 'pending_paid');
        }
        queryFilters.membershipStatus = { $in: mappedStatuses };
      }

      // Apply location village check
      if (location?.block) {
        queryFilters.block = location.block;
      }

      const members = await WomenMember.find(queryFilters)
        .populate('assignedEmployeeId', 'fullName employeeId')
        .sort({ createdAt: -1 })
        .lean();

      records = members.map((m: any) => ({
        ...m,
        id: m._id.toString(),
        assignedEmployeeName: m.assignedEmployeeId?.fullName || 'N/A',
        createdAt: new Date(m.createdAt).toLocaleDateString('en-IN')
      }));

    } else if (entityType === 'payments' || entityType === 'memberships') {
      // Payments list
      const paymentFilters: any = {};
      if (startDate || endDate) {
        paymentFilters.createdAt = {};
        if (startDate) paymentFilters.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          paymentFilters.createdAt.$lte = end;
        }
      }

      if (entityType === 'payments') {
        // Online transactions
        if (paymentStatus && paymentStatus.length > 0) {
          paymentFilters.status = { $in: paymentStatus.map((s: string) => s.toLowerCase()) };
        }
        const txs = await PaymentTransaction.find(paymentFilters)
          .populate('userId', 'fullName mobile role')
          .sort({ createdAt: -1 })
          .lean();

        records = txs.map((t: any) => ({
          ...t,
          transactionId: t.gatewayOrderId || t.cashfreeOrderId || t._id.toString(),
          userFullName: t.userId?.fullName || 'N/A',
          userMobile: t.userId?.mobile || 'N/A',
          role: t.userId?.role || t.role || 'N/A',
          createdAt: new Date(t.createdAt).toLocaleDateString('en-IN'),
          paidAt: t.paidAt ? new Date(t.paidAt).toLocaleDateString('en-IN') : 'N/A'
        }));
      } else {
        // Memberships receipt transactions
        if (paymentStatus && paymentStatus.length > 0) {
          const capitalizedStatus = paymentStatus.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
          paymentFilters.paymentStatus = { $in: capitalizedStatus };
        }
        const mems = await Membership.find(paymentFilters)
          .populate('memberId', 'name mobile')
          .sort({ createdAt: -1 })
          .lean();

        records = mems.map((m: any) => ({
          ...m,
          memberName: m.memberId?.name || 'N/A',
          memberMobile: m.memberId?.mobile || 'N/A',
          paymentDate: m.paymentDate ? new Date(m.paymentDate).toLocaleDateString('en-IN') : 'N/A',
          createdAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-IN') : 'N/A'
        }));
      }

    } else if (entityType === 'compliance') {
      // Compliance list: users with pending documents or unsigned agreements/offer letters
      const complianceFilter: any = {};
      if (status && status.length > 0) {
        complianceFilter.status = { $in: status };
      }

      const users = await User.find(complianceFilter)
        .select('fullName role status documents documentsVerified parentVendorId createdAt')
        .populate('parentVendorId', 'fullName')
        .sort({ createdAt: -1 })
        .lean();

      records = await Promise.all(
        users.map(async (u: any) => {
          let pendingDocsCount = 0;
          let hasPendingAgreement = false;
          let hasPendingOfferLetter = false;

          // Count pending docs
          if (u.documents) {
            Object.values(u.documents).forEach((doc: any) => {
              if (doc && doc.status === 'pending') pendingDocsCount++;
            });
          }

          // Check unsigned agreements
          if (u.role === 'vendor' || u.role === 'sub_vendor') {
            const agreement = await VendorAgreement.findOne({ vendorId: u._id }).lean();
            if (!agreement || agreement.status === 'pending' || !agreement.digitalAcceptanceStatus) {
              hasPendingAgreement = true;
            }
          }

          // Check unsigned offer letter
          if (u.role === 'employee') {
            const offer = await EmployeeOfferLetter.findOne({ employeeId: u._id }).lean();
            if (!offer || offer.status === 'pending' || !offer.digitalAcceptanceStatus) {
              hasPendingOfferLetter = true;
            }
          }

          return {
            id: u._id.toString(),
            fullName: u.fullName,
            role: u.role,
            status: u.status,
            parentVendorName: u.parentVendorId?.fullName || 'N/A',
            pendingDocsCount,
            agreementStatus: hasPendingAgreement ? 'Pending Acceptance' : 'Signed/Completed',
            offerLetterStatus: hasPendingOfferLetter ? 'Pending Acceptance' : 'Signed/Completed',
            createdAt: new Date(u.createdAt).toLocaleDateString('en-IN')
          };
        })
      );
    }

    // 4. Log report generation in Audit Log
    const filtersSummary = {
      entityType,
      startDate,
      endDate,
      status,
      paymentStatus,
      location
    };
    const fileName = `report_${entityType}_${Date.now()}.${format === 'excel' ? 'xls' : format}`;

    await ReportAuditLog.create({
      generatedBy: currentUserId,
      reportType: `Custom ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
      filtersUsed: filtersSummary,
      recordsIncluded: records.length,
      format,
      fileName
    });

    // 5. Generate and Return based on export format
    if (format === 'csv') {
      const csvData = exportToCsv(records, selectedFields);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    if (format === 'excel') {
      const excelXml = exportToExcel(records, selectedFields, entityType, filtersSummary);
      return new NextResponse(excelXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    if (format === 'pdf') {
      // Generate HTML report structure
      const reportTitle = `${entityType.replace('_', ' ')} Custom Report`;
      const tableHeaders = `<th>S.No.</th>` + selectedFields.map((f: string) => `<th>${escapeXml(f.replace(/([A-Z])/g, ' $1').toUpperCase())}</th>`).join('');
      const tableRows = records.map((r, index) => {
        return `
        <tr>
          <td>${index + 1}</td>
          ${selectedFields.map((field: string) => {
            let val: any = '';
            if (field.includes('.')) {
              const parts = field.split('.');
              let nestedVal = r;
              for (const part of parts) {
                nestedVal = nestedVal ? nestedVal[part] : '';
              }
              val = nestedVal;
            } else {
              val = r[field];
            }
            return `<td>${escapeXml(val)}</td>`;
          }).join('')}
        </tr>`;
      }).join('');

      const htmlContent = getStyledHtmlReport(`
        <div class="stats-grid" style="margin-bottom: 25px;">
          <div class="stat-card">
            <div class="value">${records.length}</div>
            <div class="label">Filtered Matches</div>
          </div>
          <div class="stat-card">
            <div class="value">${entityType.toUpperCase()}</div>
            <div class="label">Target Entity</div>
          </div>
          <div class="stat-card" style="grid-column: span 2; text-align: left;">
            <div class="value" style="font-size: 11px; font-weight: bold; color: #475569;">
              Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'All'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'All'}
            </div>
            <div class="label">Active Scope</div>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="' + selectedFields.length + '" style="text-align: center;">No matching records found.</td></tr>'}
          </tbody>
        </table>
      `, reportTitle, reportId);

      const pdfBuffer = await generatePdfBuffer(htmlContent, reportId);
      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid format requested' }, { status: 400 });

  } catch (error: any) {
    console.error('Report Generation Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Report Generation Failed' }, { status: 500 });
  }
}