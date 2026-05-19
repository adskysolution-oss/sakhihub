'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import axios from 'axios';
import { 
  Printer, ShieldCheck, MapPin, User, Calendar, 
  IndianRupee, FileText, CheckCircle2, Mail, Globe, Phone, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function MemberReceiptLandingPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#666', fontWeight: '600' }}>Retrieving Your Payment Slip...</p>
        </div>
        <style jsx>{` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `}</style>
      </DashboardLayout>
    }>
      <MemberReceiptContent />
    </Suspense>
  );
}

function MemberReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cashfree, setCashfree] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [payingOnline, setPayingOnline] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize Cashfree dynamically
  useEffect(() => {
    if (scriptLoaded && data && (window as any).Cashfree && !cashfree) {
      const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
      console.log('Initializing Cashfree for Member Receipt in mode:', mode);
      setCashfree((window as any).Cashfree({ mode }));
    }
  }, [scriptLoaded, data, cashfree]);

  // Handle Cashfree verification callback
  const handleVerifyCallback = async () => {
    const orderId = searchParams.get('order_id');
    if (orderId && !verifyingPayment) {
      setVerifyingPayment(true);
      try {
        await axios.post('/api/payment/verify', { orderId });
        router.replace('/member/receipt');
        alert("Payment verified successfully! Welcome to SakhiHub paid membership.");
      } catch (error) {
        console.error('Verification failed', error);
        alert("Payment verification failed. Please contact admin if amount was deducted.");
      } finally {
        setVerifyingPayment(false);
        fetchDashboard();
      }
    }
  };

  useEffect(() => {
    handleVerifyCallback();
  }, [searchParams]);

  const handleInitiateOnlinePayment = async () => {
    setPayingOnline(true);
    try {
      const res = await axios.post('/api/payment/create-order', { type: 'subscription' });
      if (res.data.success && res.data.data.paymentSessionId) {
        if (cashfree) {
          cashfree.checkout({
            paymentSessionId: res.data.data.paymentSessionId,
            redirectTarget: "_self"
          });
        } else {
          const mode = process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
          if ((window as any).Cashfree) {
            const cf = (window as any).Cashfree({ mode });
            setCashfree(cf);
            cf.checkout({
              paymentSessionId: res.data.data.paymentSessionId,
              redirectTarget: "_self"
            });
          } else {
            alert('Payment gateway is still loading. Please wait a moment.');
            setPayingOnline(false);
          }
        }
      } else {
        alert(res.data.message || 'Failed to initiate payment');
        setPayingOnline(false);
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      alert(error.response?.data?.message || 'Failed to initiate payment');
      setPayingOnline(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/member/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load receipt details", err);
    } finally {
      setData((prev: any) => prev || res?.data?.data); // Safe callback check
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold animate-pulse">Retrieving Your Payment Slip...</p>
        </div>
      </DashboardLayout>
    );
  }

  const membership = data?.membership;
  const profile = data?.profile;
  const fieldRecord = data?.fieldRecord;
  const membershipFee = data?.membershipFee ?? 100;

  if (!membership) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto mt-10 p-8 sm:p-12 bg-white rounded-[35px] border border-gray-100 shadow-soft text-center">
          <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <Clock size={32} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-secondary font-black">Membership Payment Pending</h2>
          <p className="text-gray-500 font-medium leading-relaxed mt-3 max-w-lg mx-auto text-sm">
            To view, download, or print your verified digital receipt and activate your platform membership, please complete your one-time ₹{membershipFee} registration fee.
          </p>

          {verifyingPayment ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 mt-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Verifying online transaction...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-10 text-left">
              {/* Option 1: Pay Online */}
              <div className="p-6 bg-[#fdfcfb] rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                    Instant Access
                  </span>
                  <h4 className="text-sm font-black text-secondary mt-3">Pay Online Now</h4>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-2">
                    Pay securely via Credit/Debit Cards, UPI, or NetBanking. Receipt instantly generated.
                  </p>
                </div>
                <button
                  onClick={handleInitiateOnlinePayment}
                  disabled={payingOnline}
                  className="mt-6 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {payingOnline ? 'Initiating...' : `Pay ₹${membershipFee} Online`}
                </button>
              </div>

              {/* Option 2: Pay Offline */}
              <div className="p-6 bg-[#fdfcfb] rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">
                    Offline Mode
                  </span>
                  <h4 className="text-sm font-black text-secondary mt-3">Direct Bank Transfer</h4>
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed mt-2">
                    Deposit ₹{membershipFee} directly to our NGO account. Share payment proof with the admin to activate membership manually from dashboard.
                  </p>
                </div>
                <button
                  onClick={() => alert("Please contact NGO Support or Admin at support@sakhihub.org to present offline transaction proof.")}
                  className="mt-6 w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-secondary hover:text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Contact Admin Support
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Navigation - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-secondary flex items-center gap-2">
            <FileText size={24} className="text-primary" /> Official Membership Slip
          </h2>
          <p className="text-gray-500 text-xs font-bold mt-1">Download, save, or print your verified registration proof.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-md cursor-pointer"
        >
          <Printer size={18} /> Print Slip
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[210mm] mx-auto bg-white print:shadow-none print:border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 rounded-[40px] overflow-hidden"
      >
        {/* Header Branding */}
        <div className="relative overflow-hidden bg-white px-8 md:px-16 pt-12 md:pt-16 pb-8 border-b-8 border-primary/10">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Sakhi<span className="text-primary">Hub</span></h1>
                <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Empowering Rural Women</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-lg md:text-2xl font-black text-secondary tracking-tight">Membership Slip</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 border border-green-100">
                  <CheckCircle2 size={12} /> Payment Confirmed
                </div>
              </div>
           </div>
        </div>

        {/* Receipt Content */}
        <div className="px-8 md:px-16 py-10 md:py-14 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16">
            {/* Left Column: Member Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Full Name</p>
                  <p className="text-xl md:text-2xl font-black text-secondary">{profile?.fullName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile No</p>
                    <p className="font-bold text-secondary text-sm">{profile?.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Village/Area</p>
                    <p className="font-bold text-secondary text-sm">{fieldRecord?.village || 'N/A'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Group</p>
                  <p className="font-bold text-secondary text-sm">{fieldRecord?.groupId?.groupName || 'Individual / Pending Allocation'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Transaction Info */}
            <div className="bg-gray-50/50 p-8 rounded-[35px] border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-secondary rounded-full" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Summary</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt No</span>
                  <span className="font-bold text-secondary text-sm">{membership.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership ID</span>
                  <span className="font-bold text-secondary text-sm">{membership.membershipId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Date</span>
                  <span className="font-bold text-secondary text-sm">
                    {new Date(membership.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Mode</span>
                  <span className="px-3 py-1 bg-white rounded-lg border border-gray-200 font-bold text-secondary text-[10px] uppercase">
                    {membership.paymentMode}
                  </span>
                </div>
                <div className="pt-6 mt-6 border-t border-gray-200 flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Fee Paid</p>
                     <p className="text-4xl font-black text-primary tracking-tight">₹{membership.amount}</p>
                   </div>
                   <div className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-1 border border-green-100 uppercase tracking-widest">
                      One-Time
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Collector */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-10 border-y border-gray-50 mb-10">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-primary/10 rounded-[20px] flex items-center justify-center text-primary shadow-inner">
                   <User size={28} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee Collected By</p>
                   <p className="text-lg font-black text-secondary leading-tight">{membership.employeeId?.fullName || 'System Admin'}</p>
                   <p className="text-[11px] font-bold text-gray-400 mt-1">Authorized Representative</p>
                </div>
             </div>
             <div className="p-5 md:p-6 bg-secondary/5 rounded-[30px] border border-secondary/10 flex items-center gap-5 max-w-[400px]">
                <ShieldCheck size={32} className="text-secondary shrink-0" />
                <p className="text-[10px] font-bold text-secondary/70 leading-relaxed italic">
                  This digital record serves as proof of membership. The transaction has been securely logged on our server. For verification, scan or check via Member Portal.
                </p>
             </div>
          </div>

          {/* Organization Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 opacity-60">
             <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">www.sakhihub.org</span>
             </div>
             <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">care@sakhihub.org</span>
             </div>
             <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">+91 9988776655</span>
             </div>
             <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-black">Madhya Pradesh</span>
             </div>
          </div>
        </div>

        {/* Print Only Disclaimer */}
        <div className="hidden print:block px-16 pb-12">
           <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <p className="text-[9px] text-gray-400 font-bold leading-relaxed uppercase tracking-[0.2em]">
                System Generated Copy • No Signature Required • Digital Verification ID: {membership._id}
              </p>
           </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .min-h-screen {
            padding: 0 !important;
            background: white !important;
          }
          div[role="navigation"], .print\\:hidden, header, aside {
            display: none !important;
          }
          .max-w-3xl, .max-w-4xl {
            max-width: 100% !important;
          }
          .rounded-[40px] {
            border-radius: 0 !important;
          }
          .shadow-2xl {
            box-shadow: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
