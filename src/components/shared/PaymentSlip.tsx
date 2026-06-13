'use client';

import React, { useRef } from 'react';
import {
  ShieldCheck,
  Check,
  UserPlus,
  Crown,
  Shield,
  Download,
  Printer,
  User,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Building,
  Users,
  AlertTriangle
} from 'lucide-react';

export interface PaymentSlipProps {
  type: 'membership' | 'subscription' | 'deposit';
  data: {
    receiptNumber: string;
    transactionId: string;
    paymentDate: string | Date;
    paymentTime: string;
    paymentMode: string;
    amount: number;
    // Payer Details
    fullName: string;
    mobileNumber: string;
    villageArea?: string;
    assignedGroup?: string;
    role?: string; // e.g. 'Member', 'Vendor', 'Sub-Vendor', 'Employee'
    referredBy?: {
      name: string;
      role: string;
    };
    // Subscription Details
    planType?: string; // e.g. 'Standard Partner', 'Super Admin Plan'
    planDuration?: string; // e.g. '12 Months'
    renewalDate?: string | Date;
    // Security Deposit Details
    depositPurpose?: string;
    approvalStatus?: string;
    // Verification details
    feeCollectedBy?: string;
    verifiedBy?: string;
    verificationHash?: string;
  };
}

const PaymentSlip: React.FC<PaymentSlipProps> = ({ type, data }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const getSlipConfig = () => {
    switch (type) {
      case 'subscription':
        return {
          title: 'PLATFORM SUBSCRIPTION SLIP',
          icon: Crown,
          amountLabel: 'SUBSCRIPTION AMOUNT',
          extraLabel: data.planDuration ? `${data.planDuration.toUpperCase()} PLAN` : 'SUBSCRIPTION PLAN',
          accentGradient: 'from-blue-600 to-indigo-600',
          accentText: 'text-indigo-600',
          accentBg: 'bg-indigo-50/50',
          accentBorder: 'border-indigo-100',
          iconBg: 'bg-blue-50 text-blue-600',
        };
      case 'deposit':
        return {
          title: 'SECURITY DEPOSIT SLIP',
          icon: Shield,
          amountLabel: 'SECURITY DEPOSIT',
          extraLabel: 'REFUNDABLE SECURITY',
          accentGradient: 'from-emerald-600 to-teal-600',
          accentText: 'text-emerald-600',
          accentBg: 'bg-emerald-50/50',
          accentBorder: 'border-emerald-100',
          iconBg: 'bg-emerald-50 text-emerald-600',
        };
      case 'membership':
      default:
        return {
          title: 'MEMBERSHIP REGISTRATION SLIP',
          icon: UserPlus,
          amountLabel: 'MEMBERSHIP FEE PAID',
          extraLabel: 'ONE-TIME REGISTRATION',
          accentGradient: 'from-purple-600 to-pink-600',
          accentText: 'text-purple-600',
          accentBg: 'bg-purple-50/50',
          accentBorder: 'border-purple-100',
          iconBg: 'bg-purple-50 text-purple-600',
        };
    }
  };

  const config = getSlipConfig();
  const IconComponent = config.icon;

  const handlePrint = () => {
    window.print();
  };

  // Format date display
  const formatDate = (dateVal: string | Date) => {
    if (!dateVal) return 'N/A';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate a mock verification hash if not present
  const hash = data.verificationHash || `SH-${type.toUpperCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Action Buttons Toolbar (Hidden on Print) */}
      <div className="flex justify-end gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-secondary border border-gray-200 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Printer size={16} />
          Print Receipt
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-xs hover:opacity-95 transition-opacity shadow-md shadow-primary/15"
        >
          <Download size={16} />
          Save as PDF
        </button>
      </div>

      {/* Printable Receipt Card */}
      <div
        ref={printRef}
        className="printable-card-wrapper bg-white border border-gray-100 rounded-[24px] p-5 md:p-6 shadow-2xl shadow-gray-100/50 relative overflow-hidden print:shadow-none print:border-none print:rounded-none"
      >
        {/* Style tag injection for custom print layout override */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm !important;
            }
            body * {
              visibility: hidden !important;
            }
            .printable-card-wrapper, .printable-card-wrapper * {
              visibility: visible !important;
            }
            html, body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              overflow: visible !important;
            }
            header, footer, nav, button, .print\\:hidden, [role="navigation"] {
              display: none !important;
            }
            .printable-card-wrapper {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              overflow: visible !important;
            }
            .printable-card-wrapper .-mx-6 {
              margin-left: -1.5rem !important;
              margin-right: -1.5rem !important;
              margin-bottom: -1.5rem !important;
            }
          }
        `}} />

        {/* Diagonal Soft Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-[0.02] z-0">
          <span className="text-secondary font-black text-9xl tracking-widest uppercase transform -rotate-12">
            SAKHIHUB
          </span>
        </div>

        {/* 1. HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="SakhiHub Logo"
              className="h-[48px] w-auto shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                if (fallback) (fallback as HTMLElement).style.display = 'block';
              }}
            />
            <div>
              <div className="logo-fallback text-xl font-black text-secondary leading-none">
                Sakhi<span className="text-primary">Hub</span>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Empowering Rural Women
              </p>
            </div>
          </div>

          <div className="text-left md:text-right">
            <h1 className="text-base md:text-lg font-black text-secondary tracking-wide">
              {config.title}
            </h1>
            <div className="flex md:justify-end items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Check size={10} className="stroke-[3]" />
                Payment Confirmed
              </span>
            </div>
          </div>
        </div>

        {/* Top Divider */}
        <div className="h-[2px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 my-5 relative z-10" />

        {/* 2. MAIN 2-COLUMN CONTENT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-5 relative z-10">

          {/* LEFT COLUMN: Payer & Member Details */}
          <div className="md:col-span-7 print:col-span-7 space-y-3">
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <User size={13} className="text-primary" />
                Member Details
              </h3>

              <div className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-4 md:p-5 space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</span>
                  <p className="text-lg font-black text-secondary mt-1">{data.fullName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number</span>
                    <p className="text-xs font-bold text-secondary mt-0.5">{data.mobileNumber}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Village / Area</span>
                    <p className="text-xs font-bold text-secondary mt-0.5">{data.villageArea || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Assigned Group</span>
                  <p className="text-xs font-bold text-secondary mt-0.5">{data.assignedGroup || 'Individual / Pending Allocation'}</p>
                </div>

                {/* Role Badge */}
                {data.role && (
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Hierarchy Role</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#FFF5F8] text-primary border border-red-50">
                      {data.role}
                    </span>
                  </div>
                )}

                {/* Referred By */}
                {data.referredBy && (
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                      <Users size={18} />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Referred By</span>
                      <p className="text-xs font-black text-secondary">{data.referredBy.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">({data.referredBy.role})</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Transaction Summary */}
          <div className="md:col-span-5 print:col-span-5 space-y-3">
            <div>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Building size={13} className="text-primary" />
                Transaction Summary
              </h3>

              <div className="bg-white border border-gray-100 rounded-[20px] p-4 md:p-5 space-y-1.5 shadow-sm">

                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Receipt No.</span>
                  <span className="text-xs font-black text-secondary tracking-wide">{data.receiptNumber}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction ID</span>
                  <span className="text-xs font-bold text-secondary truncate max-w-[160px]">{data.transactionId}</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Date</span>
                  <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                    <Calendar size={12} className="text-gray-400" />
                    {formatDate(data.paymentDate)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Time</span>
                  <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                    <Clock size={12} className="text-gray-400" />
                    {data.paymentTime}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Mode</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                    {data.paymentMode}
                  </span>
                </div>

                {/* Dynamic Extra Detail Fields for Subscription & Deposit */}
                {type === 'subscription' && (data.planType || data.renewalDate) && (
                  <div className="pt-1.5 space-y-1.5 border-t border-gray-100">
                    {data.planType && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Type</span>
                        <span className="text-xs font-bold text-secondary">{data.planType}</span>
                      </div>
                    )}
                    {data.renewalDate && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Renewal Date</span>
                        <span className="text-xs font-bold text-secondary">{formatDate(data.renewalDate)}</span>
                      </div>
                    )}
                  </div>
                )}

                {type === 'deposit' && (data.depositPurpose || data.approvalStatus) && (
                  <div className="pt-1.5 space-y-1.5 border-t border-gray-100">
                    {data.depositPurpose && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purpose</span>
                        <span className="text-xs font-bold text-secondary">{data.depositPurpose}</span>
                      </div>
                    )}
                    {data.approvalStatus && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                        <span className="text-xs font-bold text-secondary uppercase tracking-widest">{data.approvalStatus}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Amount Box */}
                <div className={`mt-4 rounded-[16px] border p-3 ${config.accentBg} ${config.accentBorder} flex justify-between items-center`}>
                  <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">{config.amountLabel}</span>
                    <p className={`text-xl font-black ${config.accentText} mt-0.5`}>₹{data.amount}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white border border-gray-100 text-secondary shadow-sm`}>
                      {config.extraLabel}
                    </span>
                    {type !== 'deposit' && (
                      <span className="text-[8px] font-black text-red-500 uppercase tracking-wider">
                        NON-REFUNDABLE
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SUCCESS MESSAGE & SECURITY NOTICE */}
        <div className="mt-4 bg-purple-50/50 border border-purple-100/50 rounded-2xl p-3 flex gap-3 relative z-10">
          <div className="w-8 h-8 rounded-[10px] bg-purple-100/50 flex items-center justify-center text-purple-600 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-secondary uppercase tracking-wider">Payment Successful</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed font-semibold mt-0.5">
              This digital receipt serves as official proof of payment. The transaction has been securely recorded, reconciled, and audited in the SakhiHub distributed ledger database.
              {type !== 'deposit' && (
                <span className="text-red-500 font-bold block mt-1">
                  Please note: This payment is strictly non-refundable.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* SECURITY DEPOSIT IMPORTANT NOTICE */}
        {type === 'deposit' && (
          <div className="mt-3 bg-amber-50/40 border border-amber-200/50 rounded-xl p-3 flex gap-3 relative z-10 text-[9.5px]">
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-amber-900">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-600 text-white tracking-wide">
                  IMPORTANT
                </span>
                <strong className="text-amber-950 uppercase font-black text-[9px] tracking-wide">
                  SECURITY DEPOSIT NOTICE
                </strong>
                <span className="text-gray-400">•</span>
                <span className="font-extrabold text-amber-950">Refund Eligibility: 90 Days (3 Months) of Continuous Service</span>
              </div>
              <p className="leading-relaxed font-semibold">
                The Security Deposit shall become refundable only after successful completion of 90 days (3 months) of continuous service with SakhiHub.
                If the employee resigns, leaves voluntarily, abandons duties, remains inactive, violates company policies, or is terminated before completion of 90 days from the joining date, the Security Deposit shall not be refundable.
              </p>
              <p className="text-[8.5px] text-amber-800/80 italic font-bold">
                * The refund eligibility shall be determined solely based on SakhiHub records and compliance status.
              </p>
            </div>
          </div>
        )}

        {/* Middle Line Divider */}
        <div className="h-px bg-gray-100 my-4 relative z-10" />

        {/* 4. VERIFICATION SEAL & QR CODE & SIGNATURE INFO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 print:grid-cols-12 gap-4 items-center relative z-10">

          {/* QR Verification Code */}
          <div className="md:col-span-3 print:col-span-3 flex justify-center md:justify-start">
            <div className="bg-white border border-gray-200/80 p-3 rounded-2xl flex flex-col items-center shadow-sm shrink-0">
              <svg width="76" height="76" viewBox="0 0 29 29" className="qr-code-svg text-secondary select-none" fill="currentColor">
                <path d="M0 0h9v9H0zm1 1v7h7V1zm8 0h1v1H9zm0 2h1v1H9zm0 2h1v1H9zm0 2h1v1H9zM2 2h5v5H2V2zm18-2h9v9h-9zm1 1v7h7V1zm1 1h5v5h-5zm-12 8h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm6 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1H27zm-18 1h1v1H9zm4 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm4 0h1v1h-1zm1 0h1v1h-1zm-15 1h1v1H9zm1 0h1v1h-1zm3 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm3 0h1v1h-1zm3 0h1v1h-1zm-17 1h1v1H8zm1 0h1v1h-1zm2 0h1v1h-1zm3 0h1v1h-1zm4 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1H22zm3 0h1v1h-1zm-17 1h1v1H8zm2 0h1v1H10zm1 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm3 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm-12 1h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm1 0h1v1h-1zm1 0h1v1h-1zm3 0h1v1h-1zm2 0h1v1H27zm0 1v9h9V20zm1 1h7v7h-7zm1 1h5v5h-5zm-20 7h9v-9H0zm1-8h7v7H1zm1-5h5v5H2zm11 2h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1zm-4 1h1v1h-1zm2 0h1v1h-1zm-3 1h1v1h-1zm1 0h1v1h-1zm3 0h1v1h-1zm-5 1h1v1h-1zm1 0h1v1h-1zm2 0h1v1h-1zm2 0h1v1h-1z" />
              </svg>
              <span className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Scan to Verify</span>
            </div>
          </div>

          {/* Verification Hash & Notice */}
          <div className="md:col-span-5 print:col-span-5 text-center md:text-left space-y-1">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Audit Trail Token</span>
            <span className="text-[10px] font-mono text-secondary font-black bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block max-w-full truncate">
              {hash}
            </span>
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              Digitally sealed & verified by SakhiHub Server
            </p>
          </div>

          {/* Signature Line */}
          <div className="md:col-span-4 print:col-span-4 flex flex-col items-center md:items-end">
            <div className="w-40 border-b border-gray-200 pb-2 text-center select-none font-serif italic text-secondary font-bold text-sm tracking-wider">
              System Seal
            </div>
            <span className="text-[9px] uppercase font-black text-gray-400 mt-2 tracking-widest">Authorized Representative</span>
          </div>
        </div>

        {/* 5. BOTTOM INFO BLOCKS */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 pt-4 border-t border-gray-100 relative z-10">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <User size={14} />
            </div>
            <div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Fee Collected By</span>
              <p className="text-[10px] font-bold text-secondary">{data.feeCollectedBy || 'System Admin'}</p>
              <p className="text-[8px] text-gray-400">SakhiHub Representative</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={14} />
            </div>
            <div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Verification</span>
              <p className="text-[10px] font-bold text-secondary">{data.verifiedBy || 'Auto-Verified & Approved'}</p>
              <p className="text-[8px] text-gray-400">SakhiHub Audit Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
              <IconComponent size={14} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Thank You</span>
              <p className="text-[10px] font-bold text-secondary">
                {type === 'membership' ? 'Welcome to SakhiHub!' : type === 'subscription' ? 'Thank you for subscribing!' : 'Deposit safely held.'}
              </p>
              <p className="text-[8px] text-gray-400">Together, we grow stronger.</p>
            </div>
          </div>
        </div>

        {/* 6. SYSTEM FOOTER STRIP */}
        <div className="mt-5 -mx-5 md:-mx-6 -mb-5 md:-mb-6 bg-gray-50 border-t border-gray-100 px-5 py-2.5 flex flex-wrap print:flex-nowrap justify-center md:justify-between items-center gap-3 relative z-10 text-[9px] font-bold text-gray-400 uppercase tracking-widest rounded-b-[24px]">
          <div className="flex items-center gap-1.5">
            <Globe size={11} className="text-gray-400 shrink-0" />
            <a href="https://www.sakhihub.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-gray-400 no-underline">
              www.sakhihub.org
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail size={11} className="text-gray-400 shrink-0" />
            <a href="mailto:care@sakhihub.org" className="hover:text-primary transition-colors text-gray-400 no-underline">
              care@sakhihub.org
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone size={11} className="text-gray-400 shrink-0" />
            <span>+91 9988273555</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            <span className="truncate">Pu 4, Behind C21 Mall, Scheme 54, Indore, MP 452010</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSlip;
