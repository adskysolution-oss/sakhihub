'use client';

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  RefreshCcw,
  LogOut,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ClipboardCheck,
  Send,
  Clock
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';
import { toast } from 'sonner';

// ─── Verification Form ────────────────────────────────────────────────────────

interface VerificationFormProps {
  profile: any;
  paymentType: 'subscription' | 'deposit';
  onSuccess: () => void;
  onCancel: () => void;
}

function VerificationForm({ profile, paymentType, onSuccess, onCancel }: VerificationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: profile?.fullName || '',
    mobile: profile?.mobile || '',
    vendorOrSubVendorId: profile?.vendorCode || profile?.subVendorCode || '',
    amount: '',
    transactionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    remark: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.transactionId || !form.paymentDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/payment/manual-request', {
        type: paymentType,
        ...form,
        amount: Number(form.amount),
      });
      if (res.data.success) {
        toast.success('Verification details submitted! Admin will review and unlock your account.');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit verification details.');
    } finally {
      setSubmitting(false);
    }
  };

  const label = paymentType === 'subscription' ? 'Platform Access Subscription' : 'Refundable Security Deposit';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="bg-white rounded-[32px] border border-primary/20 shadow-xl p-6 md:p-8 text-left"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ClipboardCheck size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-base font-black text-secondary">Submit Payment Verification</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-6 mt-2 leading-relaxed">
        After completing your payment, fill in the details below. Admin will verify your transaction and unlock your next step.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="verify-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              id="verify-mobile"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
            />
          </div>

          {/* Vendor/Sub-Vendor ID */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Vendor / Sub-Vendor ID <span className="text-red-500">*</span>
            </label>
            <input
              id="verify-vendor-id"
              name="vendorOrSubVendorId"
              type="text"
              value={form.vendorOrSubVendorId}
              onChange={handleChange}
              required
              placeholder="e.g. SH-VND-0001"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Payment Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="verify-amount"
              name="amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={handleChange}
              required
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
            />
          </div>

          {/* Transaction ID / UTR */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Transaction ID / UTR <span className="text-red-500">*</span>
            </label>
            <input
              id="verify-txn-id"
              name="transactionId"
              type="text"
              value={form.transactionId}
              onChange={handleChange}
              required
              placeholder="e.g. 123456789012"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              id="verify-payment-date"
              name="paymentDate"
              type="date"
              value={form.paymentDate}
              onChange={handleChange}
              required
              max={new Date().toISOString().slice(0, 10)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
            Remark <span className="text-gray-400 font-medium normal-case">(optional)</span>
          </label>
          <textarea
            id="verify-remark"
            name="remark"
            value={form.remark}
            onChange={handleChange}
            rows={2}
            placeholder="Any additional details about your payment..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            id="submit-verification-form"
            className="flex-1 py-3.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
          >
            <Send size={14} />
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 bg-gray-50 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cashfree, setCashfree] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Manual flow state
  const [verificationFormType, setVerificationFormType] = useState<'subscription' | 'deposit' | null>(null);
  const [submittedTypes, setSubmittedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load Cashfree SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (scriptLoaded && data && window.Cashfree && !cashfree) {
      const mode = 'production';
      setCashfree(window.Cashfree({ mode }));
    }
  }, [scriptLoaded, data, cashfree]);

  // Fetch existing manual request submissions to pre-fill submitted state
  const fetchManualRequestStatus = async () => {
    try {
      const res = await axios.get('/api/payment/manual-request');
      if (res.data.success) {
        const pending = new Set<string>(
          res.data.data
            .filter((r: any) => ['pending', 'approved'].includes(r.status))
            .map((r: any) => r.type)
        );
        setSubmittedTypes(pending);
      }
    } catch (_) { }
  };

  const fetchStatus = async () => {
    try {
      const [res, meRes] = await Promise.all([
        axios.get('/api/payment/status'),
        axios.get('/api/auth/me'),
      ]);

      if (res.data.success && meRes.data.success) {
        const paymentData = res.data.data;
        const user = meRes.data.data;

        setData(paymentData);
        setProfile(user);

        if (paymentData.paymentCompleted || user.paymentCompleted) {
          if (user.role === 'vendor') {
            router.push(user.dashboardAccess ? '/vendor/dashboard' : '/vendor/onboarding');
          } else if (['sub_vendor', 'employee'].includes(user.role)) {
            if (user.assignmentStatus === 'completed' && user.dashboardAccess) {
              router.push(`/${user.role.replace('_', '-')}/dashboard`);
            } else {
              router.push('/pending-assignment');
            }
          }
        }
      }
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCallback = async () => {
    const orderId = searchParams.get('order_id');
    if (orderId) {
      setProcessing(true);
      try {
        await axios.post('/api/payment/verify', { orderId });
        router.replace('/payment-pending');
      } catch (error) {
        console.error('Verification failed', error);
      } finally {
        setProcessing(false);
        fetchStatus();
      }
    } else {
      fetchStatus();
    }
  };

  useEffect(() => {
    handleVerifyCallback();
    fetchManualRequestStatus();

    // Poll for status updates (admin approval / webhook)
    const interval = setInterval(() => {
      if (!processing) {
        fetchStatus();
        fetchManualRequestStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, processing]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Cashfree gateway payment (unchanged)
  const initiatePayment = async (type: 'subscription' | 'deposit') => {
    setProcessing(true);
    try {
      const res = await axios.post('/api/payment/create-order', { type });
      if (res.data.success) {
        if (res.data.data.paymentUrl) {
          // PhonePe or other redirect-based gateways
          window.location.href = res.data.data.paymentUrl;
        } else if (res.data.data.paymentSessionId) {
          // Cashfree inline checkout
          if (cashfree) {
            cashfree.checkout({
              paymentSessionId: res.data.data.paymentSessionId,
              redirectTarget: "_self"
            });
          } else {
            toast.error('Payment gateway is still loading. Please wait a moment.');
            setProcessing(false);
          }
        } else {
          toast.error('Invalid payment response from server');
          setProcessing(false);
        }
      } else {
        toast.error(res.data.message || 'Failed to initiate payment');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleVerificationSuccess = (type: 'subscription' | 'deposit') => {
    setVerificationFormType(null);
    setSubmittedTypes(prev => new Set(prev).add(type));
    fetchManualRequestStatus();
  };

  const isManualMode = data?.gatewayEnabled === false;

  if (loading || processing) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-semibold animate-pulse">{processing ? 'Processing Payment...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full">
        {/* Animated Icon Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
          <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mx-auto border border-primary/10">
            <CreditCard size={64} className="text-primary animate-bounce-slow" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
            Payment Stage
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-black text-secondary mb-6 leading-tight">
          Complete <span className="text-primary">Payment</span>
        </h1>

        <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-xl mx-auto">
          Your documents have been verified! To unlock your dashboard and activate your account, please complete the required payments.
        </p>

        {/* Unified Stepper */}
        {profile && <OnboardingStepper user={profile} />}

        {/* Manual mode info banner */}
        {isManualMode && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm">Online Payment via Gateway is Currently Unavailable</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Please use the Payment Request link below to complete your payment, then submit your transaction details for admin verification. Once verified, your dashboard will be unlocked automatically.
              </p>
            </div>
          </div>
        )}

        {/* Payment Cards */}
        <div className="flex flex-col gap-6 mb-8 text-left">
          {data?.subscription?.required && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 md:p-8 rounded-[40px] border shadow-xl flex flex-col gap-6 ${data.subscription.paid ? 'border-green-100 shadow-green-500/5' : 'border-primary/20 shadow-primary/5'}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${data.subscription.paid ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-br from-primary to-secondary text-white shadow-primary/20'}`}>
                    {data.subscription.paid ? <CheckCircle2 size={32} /> : <IndianRupee size={32} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-secondary leading-tight">Platform Access Subscription</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Required for access</p>
                    <p className="text-2xl font-bold mt-2 text-secondary">₹{data.subscription.amount}</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2 items-end">
                  {data.subscription.paid ? (
                    <div className="px-8 py-4 bg-green-50 text-green-600 rounded-2xl font-black text-[12px] uppercase tracking-widest text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Paid
                    </div>
                  ) : isManualMode ? (
                    <>
                      {/* Manual mode: correct URL for this role's subscription payment */}
                      {data.subscription.paymentRequestUrl ? (
                        <a
                          href={data.subscription.paymentRequestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          id="pay-subscription-request-link"
                          className="w-full px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={15} /> Pay via Payment Request
                        </a>
                      ) : (
                        <div className="w-full px-6 py-3 rounded-2xl bg-gray-100 text-gray-400 font-black text-[11px] uppercase tracking-widest text-center">
                          Contact admin for payment link
                        </div>
                      )}
                      {/* After payment: submit verification */}
                      {!submittedTypes.has('subscription') ? (
                        <button
                          onClick={() => setVerificationFormType('subscription')}
                          id="submit-subscription-verification"
                          className="w-full px-6 py-3 rounded-2xl border border-primary/30 text-primary font-black text-[11px] uppercase tracking-widest hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                        >
                          <ClipboardCheck size={13} /> I've already paid – Submit Details
                        </button>
                      ) : (
                        <div className="w-full px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                          <Clock size={13} /> Verification Pending Admin Review
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => initiatePayment('subscription')}
                      className="w-full px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Inline verification form for subscription */}
              <AnimatePresence>
                {verificationFormType === 'subscription' && !data.subscription.paid && (
                  <VerificationForm
                    profile={profile}
                    paymentType="subscription"
                    onSuccess={() => handleVerificationSuccess('subscription')}
                    onCancel={() => setVerificationFormType(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {data?.deposit?.required && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-white p-6 md:p-8 rounded-[40px] border shadow-xl flex flex-col gap-6 ${data.deposit.paid ? 'border-green-100 shadow-green-500/5' : 'border-secondary/20 shadow-secondary/5'}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${data.deposit.paid ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-br from-secondary to-gray-800 text-white shadow-secondary/20'}`}>
                    {data.deposit.paid ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-secondary leading-tight">Refundable Vendor Security Deposit</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Refundable Policy</p>
                    <p className="text-2xl font-bold mt-2 text-secondary">₹{data.deposit.amount}</p>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2 items-end">
                  {data.deposit.paid ? (
                    <div className="px-8 py-4 bg-green-50 text-green-600 rounded-2xl font-black text-[12px] uppercase tracking-widest text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Paid
                    </div>
                  ) : isManualMode ? (
                    <>
                      {/* Manual mode: correct URL for this role's deposit payment */}
                      {data.deposit.paymentRequestUrl ? (
                        <a
                          href={data.deposit.paymentRequestUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          id="pay-deposit-request-link"
                          className="w-full px-8 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all bg-secondary text-white shadow-secondary/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={15} /> Pay via Payment Request
                        </a>
                      ) : (
                        <div className="w-full px-6 py-3 rounded-2xl bg-gray-100 text-gray-400 font-black text-[11px] uppercase tracking-widest text-center">
                          Contact admin for payment link
                        </div>
                      )}
                      {!submittedTypes.has('deposit') ? (
                        <button
                          onClick={() => setVerificationFormType('deposit')}
                          id="submit-deposit-verification"
                          className="w-full px-6 py-3 rounded-2xl border border-secondary/30 text-secondary font-black text-[11px] uppercase tracking-widest hover:bg-secondary/5 transition-colors flex items-center justify-center gap-2"
                        >
                          <ClipboardCheck size={13} /> I've already paid – Submit Details
                        </button>
                      ) : (
                        <div className="w-full px-6 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                          <Clock size={13} /> Verification Pending Admin Review
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => initiatePayment('deposit')}
                      className="w-full px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all bg-secondary text-white shadow-secondary/20 hover:scale-105 active:scale-95"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>

              {/* Inline verification form for deposit */}
              <AnimatePresence>
                {verificationFormType === 'deposit' && !data.deposit.paid && (
                  <VerificationForm
                    profile={profile}
                    paymentType="deposit"
                    onSuccess={() => handleVerificationSuccess('deposit')}
                    onCancel={() => setVerificationFormType(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {(!data?.subscription?.required && !data?.deposit?.required) && (
            <div className="bg-white p-8 rounded-[40px] border border-gray-200 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500">No payments required at this time.</h3>
              <button
                onClick={fetchStatus}
                className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button
            onClick={fetchStatus}
            className="flex items-center gap-3 px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            <RefreshCcw size={16} /> Refresh Status
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-8 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}

// TypeScript declaration for Cashfree SDK
declare global {
  interface Window {
    Cashfree: any;
  }
}
