import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import fs from 'fs';
import User from '@/models/User';
import WomenMember from '@/models/WomenMember';
import Membership from '@/models/Membership';
import PaymentTransaction from '@/models/PaymentTransaction';
import ManualPaymentRequest from '@/models/ManualPaymentRequest';
import SecurityDeposit from '@/models/SecurityDeposit';
import EmployeeOfferLetter from '@/models/EmployeeOfferLetter';
import VendorAgreement from '@/models/VendorAgreement';
import ReportAuditLog from '@/models/ReportAuditLog';
import { getAuthSession } from '@/lib/auth';
import { getStyledHtmlReport, exportToExcel, exportToCsv, escapeXml } from '@/utils/reportExporter';
import { generatePdfBuffer } from '@/utils/pdfGenerator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || (session as any).role !== 'super_admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    // TEMPORARY DEBUG LOGGER
    try {
      const allUsers = await User.find({}).select('fullName role parentVendorId vendorCode subVendorCode employeeId status').lean();
      const allMembers = await WomenMember.find({}).select('name assignedEmployeeId vendorCode subVendorCode').lean();
      const allMemberships = await Membership.find({}).lean();
      fs.writeFileSync('c:\\projects\\sakhihub\\debug_info.json', JSON.stringify({
        targetId: id,
        allUsers,
        allMembers,
        allMemberships
      }, null, 2));
    } catch (e: any) {
      fs.writeFileSync('c:\\projects\\sakhihub\\debug_info.json', JSON.stringify({ error: e.message }));
    }
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'pdf'; // 'pdf' | 'excel' | 'csv'
    const reportType = searchParams.get('reportType') || 'profile'; // 'profile' | 'network' | 'collection' | 'performance' | 'activity' | 'payment' | 'member' | 'membership'

    const sessionUser = session as any;
    const currentUserId = sessionUser.id || sessionUser.userId;

    const userObjectId = new mongoose.Types.ObjectId(id);

    // 1. Fetch User details (or check if it is in WomenMember)
    let user = await User.findById(userObjectId)
      .populate({
        path: 'parentVendorId',
        select: 'fullName role vendorCode subVendorCode',
        populate: {
          path: 'parentVendorId',
          select: 'fullName vendorCode'
        }
      })
      .lean();

    let member = null;
    if (!user) {
      member = await WomenMember.findById(userObjectId)
        .populate('assignedEmployeeId', 'fullName employeeId mobile')
        .lean();
    }

    if (!user && !member) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    const reportId = 'IND-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const fileName = `report_${reportType}_${id}_${Date.now()}.${format === 'excel' ? 'xls' : format}`;

    // ----------------------------------------------------
    // CASE A: MEMBER PROFILE SUMMARY / DETAIL ACTIONS
    // ----------------------------------------------------
    if (member) {
      const membership = await Membership.findOne({ memberId: member._id }).lean();
      
      let subVendorName = 'N/A';
      let vendorName = 'N/A';
      if (member.subVendorCode) {
        const sv = await User.findOne({ role: 'sub_vendor', subVendorCode: member.subVendorCode }).select('fullName').lean();
        if (sv) subVendorName = sv.fullName;
      }
      if (member.vendorCode) {
        const v = await User.findOne({ role: 'vendor', vendorCode: member.vendorCode }).select('fullName').lean();
        if (v) vendorName = v.fullName;
      }

      let records: any[] = [];
      let selectedFields: string[] = [];
      let reportTitle = '';
      let tableHtml = '';

      if (reportType === 'membership' || reportType === 'payment') {
        reportTitle = 'Member Membership & Payment Report';
        selectedFields = ['membershipId', 'receiptNumber', 'amount', 'paymentMode', 'paymentDate', 'paymentStatus'];
        records = [{
          membershipId: membership?.membershipId || 'N/A',
          receiptNumber: membership?.receiptNumber || 'N/A',
          amount: membership?.amount ? `₹${membership.amount}` : 'N/A',
          paymentMode: membership?.paymentMode || 'N/A',
          paymentDate: membership?.paymentDate ? new Date(membership.paymentDate).toLocaleDateString('en-IN') : 'N/A',
          paymentStatus: membership?.paymentStatus || 'N/A'
        }];
      } else {
        // profile
        reportTitle = 'Member Profile Report';
        selectedFields = ['name', 'mobile', 'connectionStatus', 'membershipStatus', 'state', 'district', 'block', 'village', 'assignedEmployee', 'assignedSubVendor', 'assignedVendor'];
        records = [{
          name: member.name,
          mobile: member.mobile,
          connectionStatus: member.connectionStatus,
          membershipStatus: member.membershipStatus,
          state: member.state,
          district: member.district,
          block: member.block,
          village: member.village,
          assignedEmployee: member.assignedEmployeeId?.fullName || 'N/A',
          assignedSubVendor: subVendorName,
          assignedVendor: vendorName
        }];
      }

      await ReportAuditLog.create({
        generatedBy: currentUserId,
        reportType: `Individual Member ${reportType}`,
        filtersUsed: { memberId: id, reportType },
        recordsIncluded: records.length,
        format,
        fileName
      });

      if (format === 'csv') {
        const csvData = exportToCsv(records, selectedFields);
        return new NextResponse(csvData, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${fileName}"` } });
      }
      if (format === 'excel') {
        const excelXml = exportToExcel(records, selectedFields, 'member', { memberId: id, reportType });
        return new NextResponse(excelXml, { status: 200, headers: { 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': `attachment; filename="${fileName}"` } });
      }

      // PDF formatting
      if (reportType === 'profile') {
        tableHtml = `
          <div class="info-grid">
            <div class="info-block">
              <h3>Member Information</h3>
              <div class="info-row"><span class="label">Full Name:</span><span class="value">${escapeXml(member.name)}</span></div>
              <div class="info-row"><span class="label">Mobile Number:</span><span class="value">${escapeXml(member.mobile)}</span></div>
              <div class="info-row"><span class="label">State:</span><span class="value">${escapeXml(member.state)}</span></div>
              <div class="info-row"><span class="label">District:</span><span class="value">${escapeXml(member.district)}</span></div>
              <div class="info-row"><span class="label">Block:</span><span class="value">${escapeXml(member.block)}</span></div>
              <div class="info-row"><span class="label">Village/Area:</span><span class="value">${escapeXml(member.village)}</span></div>
            </div>
            <div class="info-block">
              <h3>Account & Hierarchy Assignment</h3>
              <div class="info-row"><span class="label">Status:</span><span class="value">${escapeXml(member.connectionStatus)}</span></div>
              <div class="info-row"><span class="label">Membership Status:</span><span class="value">${escapeXml(member.membershipStatus)}</span></div>
              <div class="info-row"><span class="label">Assigned Executive:</span><span class="value">${escapeXml(member.assignedEmployeeId?.fullName || 'N/A')}</span></div>
              <div class="info-row"><span class="label">Sub-Vendor Partner:</span><span class="value">${escapeXml(subVendorName)}</span></div>
              <div class="info-row"><span class="label">Vendor Partner:</span><span class="value">${escapeXml(vendorName)}</span></div>
            </div>
          </div>
        `;
      } else {
        tableHtml = `
          <div class="info-block" style="margin-bottom: 20px;">
            <h3>Membership Payment Receipt</h3>
            <div class="info-grid" style="grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 0;">
              <div>
                <div class="info-row"><span class="label">Membership ID:</span><span class="value">${escapeXml(membership?.membershipId || 'N/A')}</span></div>
                <div class="info-row"><span class="label">Receipt Number:</span><span class="value">${escapeXml(membership?.receiptNumber || 'N/A')}</span></div>
                <div class="info-row"><span class="label">Paid Amount:</span><span class="value">₹${membership?.amount || 0}</span></div>
              </div>
              <div>
                <div class="info-row"><span class="label">Payment Date:</span><span class="value">${membership?.paymentDate ? new Date(membership.paymentDate).toLocaleDateString('en-IN') : 'N/A'}</span></div>
                <div class="info-row"><span class="label">Payment Mode:</span><span class="value">${escapeXml(membership?.paymentMode || 'N/A')}</span></div>
                <div class="info-row"><span class="label">Status:</span><span class="value">${escapeXml(membership?.paymentStatus || 'N/A')}</span></div>
              </div>
            </div>
          </div>
        `;
      }

      const htmlContent = getStyledHtmlReport(tableHtml, reportTitle, reportId);
      const pdfBuffer = await generatePdfBuffer(htmlContent, reportId);
      return new NextResponse(pdfBuffer as any, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` } });
    }

    // ----------------------------------------------------
    // CASE B: USER PROFILE SUMMARY (VENDOR, SUB-VENDOR, EMPLOYEE)
    // ----------------------------------------------------
    const targetUser = user!;
    const operationalStatuses = ['active', 'approved'];

    // 1. Fetch recursively all downstream IDs to compile totals
    const userHierarchy = await User.aggregate([
      { $match: { _id: userObjectId } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentVendorId',
          as: 'descendants'
        }
      }
    ]);

    const descendants = userHierarchy[0]?.descendants || [];
    const directAndIndirectUserIds = [userObjectId, ...descendants.map((d: any) => d._id)];

    const subVendorsCount = descendants.filter((d: any) => d.role === 'sub_vendor' && operationalStatuses.includes(d.status)).length;
    const employeesCount = descendants.filter((d: any) => d.role === 'employee' && operationalStatuses.includes(d.status)).length;

    // 2. Fetch all members managed directly or indirectly under this downstream chain
    const vendorCodes = [targetUser, ...descendants]
      .filter((u: any) => u.role === 'vendor' && u.vendorCode)
      .map((u: any) => u.vendorCode);
    const subVendorCodes = [targetUser, ...descendants]
      .filter((u: any) => u.role === 'sub_vendor' && u.subVendorCode)
      .map((u: any) => u.subVendorCode);

    const memberIds = await WomenMember.find({
      $or: [
        { assignedEmployeeId: { $in: directAndIndirectUserIds } },
        { subVendorCode: { $in: subVendorCodes } },
        { vendorCode: { $in: vendorCodes } }
      ]
    }).distinct('_id');

    const membersCount = memberIds.length;

    // 3. Compute collections
    const membershipPaid = await Membership.find({ memberId: { $in: memberIds }, paymentStatus: 'Paid' }).lean();
    const membershipSum = membershipPaid.reduce((sum, m) => sum + m.amount, 0);

    const deposits = await SecurityDeposit.find({ vendorId: { $in: directAndIndirectUserIds }, paymentStatus: 'paid' }).lean();
    const depositSum = deposits.reduce((sum, d) => sum + (d.paidAmount || 0), 0);

    const manualPayments = await ManualPaymentRequest.find({ userId: { $in: directAndIndirectUserIds }, status: 'approved', type: 'subscription' }).lean();
    const manualSubSum = manualPayments.reduce((sum, p) => sum + p.amount, 0);

    const onlineTx = await PaymentTransaction.find({ userId: { $in: directAndIndirectUserIds }, status: { $in: ['paid', 'completed', 'success'] } }).lean();
    const onlineDepositSum = onlineTx.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const onlineSubSum = onlineTx.filter(t => t.type === 'subscription').reduce((sum, t) => sum + t.amount, 0);

    const totalPaidCollections = membershipSum + depositSum + onlineDepositSum + manualSubSum + onlineSubSum;

    // Parent details
    let parentVendorName = 'N/A';
    let parentSubVendorName = 'N/A';
    if (targetUser.parentVendorId) {
      if (targetUser.parentVendorId.role === 'vendor') {
        parentVendorName = targetUser.parentVendorId.fullName;
      } else if (targetUser.parentVendorId.role === 'sub_vendor') {
        parentSubVendorName = targetUser.parentVendorId.fullName;
        if (targetUser.parentVendorId.parentVendorId) {
          parentVendorName = targetUser.parentVendorId.parentVendorId.fullName;
        }
      }
    }

    // Dynamic Report Types Configuration
    let records: any[] = [];
    let selectedFields: string[] = [];
    let reportTitle = '';
    let tableHtml = '';

    if (reportType === 'network') {
      reportTitle = `${targetUser.fullName} - Hierarchy Network Report`;
      selectedFields = ['fullName', 'role', 'mobile', 'status', 'district', 'block', 'createdAt'];
      records = descendants.map((d: any) => ({
        fullName: d.fullName,
        role: d.role.toUpperCase(),
        mobile: d.mobile,
        status: d.status,
        district: d.district || 'N/A',
        block: d.block || 'N/A',
        createdAt: new Date(d.createdAt).toLocaleDateString('en-IN')
      }));
    } else if (reportType === 'collection') {
      reportTitle = `${targetUser.fullName} - Collection Intelligence Report`;
      selectedFields = ['payerName', 'payerMobile', 'paymentType', 'amount', 'paymentMode', 'paymentDate', 'paymentStatus'];
      
      const allMembers = await WomenMember.find({ _id: { $in: memberIds } }).select('name mobile').lean();
      const memberMap = new Map(allMembers.map((m: any) => [m._id.toString(), m]));
      const userMap = new Map([targetUser, ...descendants].map((u: any) => [u._id.toString(), u]));

      // 1. Fetch from Membership (Member Fees)
      const allMemberships = await Membership.find({ memberId: { $in: memberIds } }).lean();

      // 2. Fetch from SecurityDeposit (Offline Deposits)
      const allDeposits = await SecurityDeposit.find({ vendorId: { $in: directAndIndirectUserIds } }).lean();

      // 3. Fetch from ManualPaymentRequest (Subscription manual requests)
      const allManualPayments = await ManualPaymentRequest.find({ userId: { $in: directAndIndirectUserIds }, type: 'subscription' }).lean();

      // 4. Fetch from PaymentTransaction (Online Transactions)
      const allOnlineTx = await PaymentTransaction.find({ userId: { $in: directAndIndirectUserIds } }).lean();

      // -- Calculate stats metrics mathematically for comparison --
      const membershipPaidSum = allMemberships.filter((m: any) => m.paymentStatus === 'Paid').reduce((sum, m) => sum + m.amount, 0);
      
      const depositPaidSum = allDeposits.reduce((sum, d) => sum + (d.paidAmount || 0), 0);
      
      const subscriptionPaidSum = allManualPayments.filter((p: any) => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);
      
      const onlineDepositPaidSum = allOnlineTx.filter((t: any) => t.type === 'deposit' && ['paid', 'completed', 'success'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);
      
      const onlineSubscriptionPaidSum = allOnlineTx.filter((t: any) => t.type === 'subscription' && ['paid', 'completed', 'success'].includes(t.status)).reduce((sum, t) => sum + t.amount, 0);

      const statsTotalPaid = membershipPaidSum + depositPaidSum + onlineDepositPaidSum + subscriptionPaidSum + onlineSubscriptionPaidSum;
      const statsTotalDeposit = depositPaidSum + onlineDepositPaidSum;
      const statsTotalMembership = membershipPaidSum;
      const statsTotalSubscription = subscriptionPaidSum + onlineSubscriptionPaidSum;

      // -- Map collections to unified record schema --
      const membershipRecords = allMemberships.map((m: any) => {
        const mem = memberMap.get(m.memberId?.toString());
        return {
          payerName: mem?.name || 'N/A',
          payerMobile: mem?.mobile || 'N/A',
          paymentType: 'Membership Fee',
          amount: `₹${m.amount}`,
          paymentMode: m.paymentMode || 'N/A',
          paymentDate: m.paymentDate ? new Date(m.paymentDate).toLocaleDateString('en-IN') : 'N/A',
          paymentStatus: m.paymentStatus || 'Pending',
          rawAmount: m.amount || 0,
          paymentStatusRaw: m.paymentStatus,
          rawDate: m.paymentDate ? new Date(m.paymentDate) : new Date(m.createdAt || Date.now())
        };
      });

      const depositRecords = allDeposits.map((d: any) => {
        const u = userMap.get(d.vendorId?.toString());
        const isPaid = d.paymentStatus === 'paid';
        const displayAmount = isPaid ? (d.paidAmount || d.amount || 0) : (d.amount || 0);
        return {
          payerName: u?.fullName || 'N/A',
          payerMobile: u?.mobile || 'N/A',
          paymentType: 'Security Deposit (Offline)',
          amount: `₹${displayAmount}`,
          paymentMode: 'Offline',
          paymentDate: d.paymentDate ? new Date(d.paymentDate).toLocaleDateString('en-IN') : 'N/A',
          paymentStatus: d.paymentStatus === 'paid' ? 'Paid' : d.paymentStatus === 'pending' ? 'Pending' : d.paymentStatus === 'partial' ? 'Partial' : d.paymentStatus || 'Pending',
          rawAmount: isPaid ? (d.paidAmount || d.amount || 0) : 0,
          paymentStatusRaw: d.paymentStatus === 'paid' ? 'Paid' : 'Pending',
          rawDate: d.paymentDate ? new Date(d.paymentDate) : new Date(d.createdAt || Date.now())
        };
      });

      const manualRecords = allManualPayments.map((r: any) => {
        const u = userMap.get(r.userId?.toString());
        const isPaid = r.status === 'approved';
        return {
          payerName: r.name || u?.fullName || 'N/A',
          payerMobile: r.mobile || u?.mobile || 'N/A',
          paymentType: 'Subscription (Manual)',
          amount: `₹${r.amount}`,
          paymentMode: 'Manual Bank Transfer',
          paymentDate: r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-IN') : 'N/A',
          paymentStatus: r.status === 'approved' ? 'Paid' : r.status === 'pending' ? 'Pending' : 'Failed',
          rawAmount: isPaid ? (r.amount || 0) : 0,
          paymentStatusRaw: r.status === 'approved' ? 'Paid' : 'Pending',
          rawDate: r.paymentDate ? new Date(r.paymentDate) : new Date(r.createdAt || Date.now())
        };
      });

      const onlineRecords = allOnlineTx.map((t: any) => {
        const u = userMap.get(t.userId?.toString());
        const isPaid = ['paid', 'completed', 'success'].includes(t.status);
        return {
          payerName: u?.fullName || 'N/A',
          payerMobile: u?.mobile || 'N/A',
          paymentType: t.type === 'deposit' ? 'Security Deposit (Online)' : 'Subscription (Online)',
          amount: `₹${t.amount}`,
          paymentMode: t.paymentMethod || 'Online Gateway',
          paymentDate: t.paidAt ? new Date(t.paidAt).toLocaleDateString('en-IN') : new Date(t.createdAt).toLocaleDateString('en-IN'),
          paymentStatus: isPaid ? 'Paid' : ['pending', 'created'].includes(t.status) ? 'Pending' : 'Failed',
          rawAmount: isPaid ? (t.amount || 0) : 0,
          paymentStatusRaw: isPaid ? 'Paid' : 'Pending',
          rawDate: t.paidAt ? new Date(t.paidAt) : new Date(t.createdAt || Date.now())
        };
      });

      records = [...membershipRecords, ...depositRecords, ...manualRecords, ...onlineRecords]
        .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      // -- Calculate report record sums --
      const reportTotalPaid = records.filter(r => r.paymentStatusRaw === 'Paid').reduce((sum, r) => sum + r.rawAmount, 0);
      const reportTotalDeposit = records.filter(r => r.paymentStatusRaw === 'Paid' && r.paymentType.includes('Deposit')).reduce((sum, r) => sum + r.rawAmount, 0);
      const reportTotalMembership = records.filter(r => r.paymentStatusRaw === 'Paid' && r.paymentType.includes('Membership')).reduce((sum, r) => sum + r.rawAmount, 0);
      const reportTotalSubscription = records.filter(r => r.paymentStatusRaw === 'Paid' && r.paymentType.includes('Subscription')).reduce((sum, r) => sum + r.rawAmount, 0);

      // Log comparison for consistency checking
      console.log(`
====== NETWORK TREE vs REPORT CONSISTENCY CHECK ======
Node ID: ${id}
Target Name: ${targetUser.fullName} (Role: ${targetUser.role})

-- NETWORK TREE METRICS (PAID) --
Memberships (Paid)  : ₹${statsTotalMembership}
Deposits (Paid)     : ₹${statsTotalDeposit}
Subscriptions (Paid): ₹${statsTotalSubscription}
Total Collections   : ₹${statsTotalPaid}

-- REPORT RECORDS METRICS (PAID) --
Memberships (Paid)  : ₹${reportTotalMembership}
Deposits (Paid)     : ₹${reportTotalDeposit}
Subscriptions (Paid): ₹${reportTotalSubscription}
Total Collections   : ₹${reportTotalPaid}

-- REPORT OVERALL METRICS --
Records Found       : ${records.length}
Total Raw Amount    : ₹${records.reduce((sum, r) => sum + r.rawAmount, 0)}
======================================================
      `);
    } else if (reportType === 'performance' && targetUser.role === 'vendor') {
      reportTitle = `${targetUser.fullName} - Downline Performance Report`;
      selectedFields = ['employeeName', 'employeeId', 'totalMembersRegistered', 'status'];
      
      const vendorEmployees = descendants.filter((d: any) => d.role === 'employee');
      records = await Promise.all(vendorEmployees.map(async (emp: any) => {
        const count = await WomenMember.countDocuments({ assignedEmployeeId: emp._id });
        return {
          employeeName: emp.fullName,
          employeeId: emp.employeeId || 'N/A',
          totalMembersRegistered: count,
          status: emp.status
        };
      }));
    } else if (reportType === 'member' && targetUser.role === 'employee') {
      reportTitle = `${targetUser.fullName} - Member Registry Report`;
      selectedFields = ['memberName', 'memberMobile', 'village', 'connectionStatus', 'membershipStatus', 'createdAt'];
      
      const employeeMembers = await WomenMember.find({ assignedEmployeeId: targetUser._id }).sort({ createdAt: -1 }).lean();
      records = employeeMembers.map((m: any) => ({
        memberName: m.name,
        memberMobile: m.mobile,
        village: m.village || 'N/A',
        connectionStatus: m.connectionStatus,
        membershipStatus: m.membershipStatus,
        createdAt: new Date(m.createdAt).toLocaleDateString('en-IN')
      }));
    } else if (reportType === 'activity' && targetUser.role === 'employee') {
      reportTitle = `${targetUser.fullName} - Field Activity Report`;
      selectedFields = ['memberName', 'memberMobile', 'village', 'status', 'createdAt'];
      
      const employeeMembers = await WomenMember.find({ assignedEmployeeId: targetUser._id }).sort({ createdAt: -1 }).lean();
      records = employeeMembers.map((m: any) => ({
        memberName: m.name,
        memberMobile: m.mobile,
        village: m.village || 'N/A',
        status: m.connectionStatus,
        createdAt: new Date(m.createdAt).toLocaleDateString('en-IN')
      }));
    } else if (reportType === 'payment' && targetUser.role === 'employee') {
      reportTitle = `${targetUser.fullName} - Employee Ledger & Payment Report`;
      selectedFields = ['paymentType', 'amount', 'paymentStatus', 'paymentMode', 'transactionId', 'paymentDate'];
      
      // Fetch online transactions
      const txs = await PaymentTransaction.find({ userId: targetUser._id }).lean();
      // Fetch deposits
      const deps = await SecurityDeposit.find({ vendorId: targetUser._id }).lean();
      
      records = [
        ...txs.map((t: any) => ({
          paymentType: `${t.type.toUpperCase()} (Online)`,
          amount: `₹${t.amount}`,
          paymentStatus: t.status,
          paymentMode: 'Online Gateway',
          transactionId: t.gatewayOrderId || t._id.toString(),
          paymentDate: new Date(t.createdAt).toLocaleDateString('en-IN')
        })),
        ...deps.map((d: any) => ({
          paymentType: 'SECURITY DEPOSIT',
          amount: `₹${d.amount}`,
          paymentStatus: d.paymentStatus,
          paymentMode: d.paymentMode || 'N/A',
          transactionId: d.receiptNumber || 'N/A',
          paymentDate: d.paymentDate ? new Date(d.paymentDate).toLocaleDateString('en-IN') : 'N/A'
        }))
      ];
    } else {
      // DEFAULT: profile summary sheet
      reportTitle = `${targetUser.role.toUpperCase()} Profile Summary Sheet`;
      selectedFields = ['fullName', 'code', 'role', 'mobile', 'email', 'status', 'paymentStatus', 'state', 'district', 'block', 'address', 'subVendorsCount', 'employeesCount', 'membersCount', 'totalPaidCollections', 'parentVendorName', 'parentSubVendorName', 'createdAt'];
      records = [{
        fullName: targetUser.fullName,
        code: targetUser.vendorCode || targetUser.subVendorCode || targetUser.employeeId || 'N/A',
        role: targetUser.role,
        mobile: targetUser.mobile,
        email: targetUser.email || 'N/A',
        status: targetUser.status,
        paymentStatus: targetUser.paymentCompleted ? 'Paid' : 'Unpaid',
        state: targetUser.state,
        district: targetUser.district,
        block: targetUser.block,
        address: targetUser.address || 'N/A',
        subVendorsCount,
        employeesCount,
        membersCount,
        totalPaidCollections: `₹${totalPaidCollections}`,
        parentVendorName,
        parentSubVendorName,
        createdAt: new Date(targetUser.createdAt).toLocaleDateString('en-IN')
      }];
    }

    await ReportAuditLog.create({
      generatedBy: currentUserId,
      reportType: `Individual ${targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1)} ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
      filtersUsed: { userId: id, reportType },
      recordsIncluded: records.length,
      format,
      fileName
    });

    if (format === 'csv') {
      const csvData = exportToCsv(records, selectedFields);
      return new NextResponse(csvData, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${fileName}"` } });
    }
    if (format === 'excel') {
      const excelXml = exportToExcel(records, selectedFields, targetUser.role, { userId: id, reportType });
      return new NextResponse(excelXml, { status: 200, headers: { 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': `attachment; filename="${fileName}"` } });
    }

    // PDF compilation layout based on report type
    if (reportType === 'profile') {
      let roleSpecificHtml = '';

      if (targetUser.role === 'vendor') {
        roleSpecificHtml = `
        <div class="stats-grid">
          <div class="stat-card"><div class="value">${subVendorsCount}</div><div class="label">Sub-Vendors</div></div>
          <div class="stat-card"><div class="value">${employeesCount}</div><div class="label">Employees</div></div>
          <div class="stat-card"><div class="value">${membersCount}</div><div class="label">Members Reach</div></div>
          <div class="stat-card"><div class="value">₹${totalPaidCollections.toLocaleString()}</div><div class="label">Paid Collections</div></div>
        </div>
        `;
      } else if (targetUser.role === 'sub_vendor') {
        roleSpecificHtml = `
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="stat-card"><div class="value">${employeesCount}</div><div class="label">Employees</div></div>
          <div class="stat-card"><div class="value">${membersCount}</div><div class="label">Members Reach</div></div>
          <div class="stat-card"><div class="value">₹${totalPaidCollections.toLocaleString()}</div><div class="label">Paid Collections</div></div>
        </div>
        <div class="info-block" style="margin-bottom: 20px;">
          <h3>Upline Partner Hierarchy</h3>
          <div class="info-row"><span class="label">Parent Vendor:</span><span class="value">${escapeXml(parentVendorName)}</span></div>
        </div>
        `;
      } else if (targetUser.role === 'employee') {
        let totalDocs = 0;
        let approvedDocs = 0;
        if (targetUser.documents) {
          Object.values(targetUser.documents).forEach((doc: any) => {
            if (doc) {
              totalDocs++;
              if (doc.status === 'approved') approvedDocs++;
            }
          });
        }

        const agreement = await VendorAgreement.findOne({ vendorId: targetUser._id }).lean();
        const offer = await EmployeeOfferLetter.findOne({ employeeId: targetUser._id }).lean();

        roleSpecificHtml = `
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="stat-card"><div class="value">${membersCount}</div><div class="label">Assigned Members</div></div>
          <div class="stat-card"><div class="value">${approvedDocs} / ${totalDocs}</div><div class="label">Approved Docs</div></div>
          <div class="stat-card"><div class="value">${targetUser.paymentCompleted ? 'Paid' : 'Pending'}</div><div class="label">Deposit Status</div></div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <h3>Upline Assignment Hierarchy</h3>
            <div class="info-row"><span class="label">Parent Sub-Vendor:</span><span class="value">${escapeXml(parentSubVendorName)}</span></div>
            <div class="info-row"><span class="label">Parent Vendor:</span><span class="value">${escapeXml(parentVendorName)}</span></div>
          </div>
          <div class="info-block">
            <h3>HR compliance letters</h3>
            <div class="info-row"><span class="label">Offer Letter:</span><span class="value">${offer?.digitalAcceptanceStatus ? 'Signed & Accepted' : 'Pending Signature'}</span></div>
            <div class="info-row"><span class="label">Employment Agreement:</span><span class="value">${agreement?.digitalAcceptanceStatus ? 'Signed & Accepted' : 'Pending Signature'}</span></div>
          </div>
        </div>
        `;
      }

      tableHtml = `
        <div class="info-grid">
          <div class="info-block">
            <h3>Profile Credentials</h3>
            <div class="info-row"><span class="label">Full Name:</span><span class="value">${escapeXml(targetUser.fullName)}</span></div>
            <div class="info-row"><span class="label">Code ID:</span><span class="value">${escapeXml(targetUser.vendorCode || targetUser.subVendorCode || targetUser.employeeId || 'N/A')}</span></div>
            <div class="info-row"><span class="label">Account Status:</span><span class="value">${escapeXml(targetUser.status)}</span></div>
            <div class="info-row"><span class="label">Verification State:</span><span class="value">${targetUser.documentsVerified ? 'Verified' : 'Pending'}</span></div>
            <div class="info-row"><span class="label">Registration Date:</span><span class="value">${new Date(targetUser.createdAt).toLocaleDateString('en-IN')}</span></div>
          </div>
          <div class="info-block">
            <h3>Contact & Location details</h3>
            <div class="info-row"><span class="label">Mobile Number:</span><span class="value">${escapeXml(targetUser.mobile)}</span></div>
            <div class="info-row"><span class="label">Email Address:</span><span class="value">${escapeXml(targetUser.email || 'N/A')}</span></div>
            <div class="info-row"><span class="label">District:</span><span class="value">${escapeXml(targetUser.district)}</span></div>
            <div class="info-row"><span class="label">Block:</span><span class="value">${escapeXml(targetUser.block)}</span></div>
            <div class="info-row"><span class="label">Street Address:</span><span class="value">${escapeXml(targetUser.address || 'N/A')}</span></div>
          </div>
        </div>

        ${roleSpecificHtml}
      `;
    } else {
      // Table formatting for grid reports (network, collections, performance, activity, payment, member)
      const tableHeaders = `<th>S.No.</th>` + selectedFields.map(f => `<th>${escapeXml(f.replace(/([A-Z])/g, ' $1').toUpperCase())}</th>`).join('');
      const tableRows = records.map((r, index) => {
        return `
        <tr>
          <td>${index + 1}</td>
          ${selectedFields.map(field => `<td>${escapeXml(r[field])}</td>`).join('')}
        </tr>`;
      }).join('');

      tableHtml = `
        <div class="stats-grid" style="margin-bottom: 25px; grid-template-columns: 1fr 1fr;">
          <div class="stat-card">
            <div class="value">${records.length}</div>
            <div class="label">Record Count</div>
          </div>
          <div class="stat-card">
            <div class="value">${reportType.toUpperCase()}</div>
            <div class="label">Report Scope</div>
          </div>
        </div>
        <table class="data-table">
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="' + selectedFields.length + '" style="text-align: center;">No records recorded under this scope.</td></tr>'}
          </tbody>
        </table>
      `;
    }

    const htmlContent = getStyledHtmlReport(tableHtml, reportTitle, reportId);
    const pdfBuffer = await generatePdfBuffer(htmlContent, reportId);
    return new NextResponse(pdfBuffer as any, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${fileName}"` } });

  } catch (error: any) {
    console.error('Individual Profile Report Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Report Compilation Failed' }, { status: 500 });
  }
}