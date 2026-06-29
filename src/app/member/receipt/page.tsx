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
import PaymentSlip from "@/components/shared/PaymentSlip";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

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
  const [payingOnline, setPayingOnline] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  // Handle Cashfree verification callback
  const handleVerifyCallback = async () => {
    const orderId = searchParams.get('order_id');
    if (orderId && !verifyingPayment) {
      setVerifyingPayment(true);
      try {
        await axios.post('/api/payment/verify', { orderId });
        router.replace('/member/receipt');
        toast.success("Payment verified successfully! Welcome to SakhiHub paid membership.");
      } catch (error) {
        console.error('Verification failed', error);
        toast.error("Payment verification failed. Please contact admin if amount was deducted.");
      } finally {
        setVerifyingPayment(false);
        fetchDashboard();
      }
    }
  };

  useEffect(() => {
    handleVerifyCallback();
  }, [searchParams]);

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiateOnlinePayment = async () => {
    setPayingOnline(true);
    try {
      const res = await axios.post('/api/payment/create-order', { type: 'subscription' });
      if (res.data.success) {
        const orderData = res.data.data;
        const gatewayProvider = orderData.provider || 'cashfree';

        if (orderData.paymentUrl) {
          // PhonePe or redirect-based gateways
          window.location.href = orderData.paymentUrl;
        } else if (gatewayProvider === 'razorpay') {
          // Razorpay inline modal checkout
          const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
          if (loaded && (window as any).Razorpay) {
            const options = {
              key: orderData.razorpayKeyId,
              amount: Math.round(orderData.amount * 100), // in paise
              currency: "INR",
              name: "SakhiHub",
              description: "Membership Subscription Payment",
              order_id: orderData.paymentSessionId,
              handler: async function (response: any) {
                setPayingOnline(false);
                setVerifyingPayment(true);
                try {
                  await axios.post('/api/payment/verify', { 
                    orderId: orderData.orderId 
                  });
                  toast.success("Payment verified successfully! Welcome to SakhiHub paid membership.");
                  router.replace('/member/receipt');
                } catch (verifyError: any) {
                  console.error('Razorpay verification error:', verifyError);
                  toast.error("Payment verification failed. Please contact admin if amount was deducted.");
                } finally {
                  setVerifyingPayment(false);
                  fetchDashboard();
                }
              },
              prefill: {
                name: profile?.fullName || '',
                email: profile?.email || '',
                contact: profile?.mobile || '',
              },
              theme: {
                color: "#EC4899", // Match primary theme color
              },
              modal: {
                ondismiss: function () {
                  setPayingOnline(false);
                }
              }
            };
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          } else {
            toast.error('Payment gateway is still loading. Please wait a moment.');
            setPayingOnline(false);
          }
        } else if (gatewayProvider === 'cashfree' && orderData.paymentSessionId) {
          // Cashfree inline checkout
          const loaded = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
          if (loaded && (window as any).Cashfree) {
            const cf = (window as any).Cashfree({ mode: 'production' });
            cf.checkout({
              paymentSessionId: orderData.paymentSessionId,
              redirectTarget: "_self"
            });
          } else {
            toast.error('Payment gateway is still loading. Please wait a moment.');
            setPayingOnline(false);
          }
        } else {
          toast.error('Failed to initiate payment');
          setPayingOnline(false);
        }
      } else {
        toast.error(res.data.message || 'Failed to initiate payment');
        setPayingOnline(false);
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
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
  const offlinePaymentEnabled = data?.membershipOfflinePaymentEnabled !== false;

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
            <div className={`grid grid-cols-1 ${offlinePaymentEnabled ? 'md:grid-cols-2 max-w-2xl' : 'max-w-md'} gap-6 mx-auto mt-10 text-left`}>
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
              {offlinePaymentEnabled && (
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
                    onClick={() => setShowBankDetails(true)}
                    className="mt-6 w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-secondary hover:text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    View Bank Details
                  </button>
                </div>
              )}
            </div>
          )}

          {showBankDetails && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 border border-gray-100 shadow-2xl relative animate-in fade-in zoom-in duration-200 text-center">
                <h3 className="text-lg font-black text-secondary mb-4 flex items-center justify-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={22} /> Offline Bank Transfer
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Please deposit the membership fee of <strong>₹{membershipFee}</strong> directly into our NGO bank account:
                </p>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3 mb-6 text-left">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Bank Name</span>
                    <span className="text-xs font-bold text-secondary">State Bank of India</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Account Name</span>
                    <span className="text-xs font-bold text-secondary">SakhiHub Foundation</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Account Number</span>
                    <span className="text-xs font-bold text-secondary font-mono">41234567890</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">IFSC Code</span>
                    <span className="text-xs font-bold text-secondary font-mono">SBIN0001234</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Branch</span>
                    <span className="text-xs font-bold text-secondary">New Delhi Main Branch</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-100 leading-relaxed mb-6 font-semibold text-left">
                  Note: After transfer, please email your transaction receipt/proof along with your Name and Mobile to <strong>support@sakhihub.org</strong> for activation.
                </p>
                <button
                  onClick={() => setShowBankDetails(false)}
                  className="w-full py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  I Understand
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const payDate = membership ? new Date(membership.paymentDate) : new Date();
  const paymentTimeStr = membership?.paymentTime || payDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const slipData = {
    receiptNumber: membership?.receiptNumber || 'N/A',
    transactionId: membership?.cashfreeOrderId || membership?.transactionId || 'N/A',
    paymentDate: payDate,
    paymentTime: paymentTimeStr,
    paymentMode: membership?.paymentMode || 'ONLINE',
    amount: membership?.amount || membershipFee,
    fullName: profile?.fullName || 'N/A',
    mobileNumber: profile?.mobile || 'N/A',
    villageArea: fieldRecord?.village || fieldRecord?.groupId?.village || 'N/A',
    assignedGroup: fieldRecord?.groupId?.groupName || 'Individual / Pending Allocation',
    role: 'Member',
    referredBy: fieldRecord?.assignedEmployeeId ? {
      name: fieldRecord.assignedEmployeeId.fullName,
      role: 'Employee'
    } : fieldRecord?.createdBy ? {
      name: fieldRecord.createdBy.fullName,
      role: 'Regional Coordinator'
    } : undefined,
    feeCollectedBy: membership?.employeeId?.fullName || 'System Admin',
    verifiedBy: 'SakhiHub Auto-Verify API',
    verificationHash: membership?._id ? `SH-MEM-${membership._id.toString().substring(0,8).toUpperCase()}` : undefined
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PaymentSlip type="membership" data={slipData} />
      </div>
    </DashboardLayout>
  );
}
