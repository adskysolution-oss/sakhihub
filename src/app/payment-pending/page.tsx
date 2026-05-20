'use client';

import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  ShieldCheck, 
  RefreshCcw, 
  LogOut,
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { getCashfreeJsUrl } from "@/lib/cashfree";
import { Suspense } from "react";
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cashfree, setCashfree] = useState<any>(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Cashfree SDK
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

  useEffect(() => {
    if (scriptLoaded && data && window.Cashfree && !cashfree) {
      const mode = 'production';
      console.log('Initializing Cashfree in mode:', mode);
      setCashfree(window.Cashfree({ mode }));
    }
  }, [scriptLoaded, data, cashfree]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/payment/status');
      const meRes = await axios.get('/api/auth/me');
      
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
        // Remove query params
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
    
    // Poll for status in case of webhook or admin manual override
    const interval = setInterval(() => {
      if (!processing) fetchStatus();
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

  const initiatePayment = async (type: 'subscription' | 'deposit') => {
    setProcessing(true);
    try {
      const res = await axios.post('/api/payment/create-order', { type });
      if (res.data.success && res.data.data.paymentSessionId) {
        if (cashfree) {
          cashfree.checkout({
            paymentSessionId: res.data.data.paymentSessionId,
            redirectTarget: "_self"
          });
        } else {
          alert('Payment gateway is still loading. Please wait a moment.');
          setProcessing(false);
        }
      } else {
        alert(res.data.message || 'Failed to initiate payment');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      alert(error.response?.data?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

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

        {/* Warning if gateway not configured */}
        {data && data.isCashfreeConfigured === false && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-left">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm">Online Payments Currently Unavailable</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                The payment gateway is currently under maintenance. Please contact the administrator for manual payment processing (UPI, Bank Transfer, or Cash). Once the admin verifies your payment, your dashboard will be unlocked automatically.
              </p>
            </div>
          </div>
        )}

        {/* Payment Cards */}
        <div className="flex flex-col gap-6 mb-16 text-left">
          {data?.subscription?.required && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 md:p-8 rounded-[40px] border shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 ${data.subscription.paid ? 'border-green-100 shadow-green-500/5' : 'border-primary/20 shadow-primary/5'}`}
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${data.subscription.paid ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-br from-primary to-secondary text-white shadow-primary/20'}`}>
                  {data.subscription.paid ? <CheckCircle2 size={32} /> : <IndianRupee size={32} />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-secondary leading-tight">Platform Subscription</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Required for access</p>
                  <p className="text-2xl font-bold mt-2 text-secondary">₹{data.subscription.amount}</p>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                {data.subscription.paid ? (
                  <div className="px-8 py-4 bg-green-50 text-green-600 rounded-2xl font-black text-[12px] uppercase tracking-widest text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Paid
                  </div>
                ) : (
                  <button 
                    onClick={() => initiatePayment('subscription')}
                    disabled={data.isCashfreeConfigured === false}
                    className={`w-full px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all ${data.isCashfreeConfigured === false ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}`}
                  >
                    {data.isCashfreeConfigured === false ? 'Unavailable' : 'Pay Now'}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {data?.deposit?.required && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`bg-white p-6 md:p-8 rounded-[40px] border shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 ${data.deposit.paid ? 'border-green-100 shadow-green-500/5' : 'border-secondary/20 shadow-secondary/5'}`}
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${data.deposit.paid ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-green-500/20' : 'bg-gradient-to-br from-secondary to-gray-800 text-white shadow-secondary/20'}`}>
                  {data.deposit.paid ? <CheckCircle2 size={32} /> : <ShieldCheck size={32} />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-secondary leading-tight">Security Deposit</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Refundable Policy</p>
                  <p className="text-2xl font-bold mt-2 text-secondary">₹{data.deposit.amount}</p>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                {data.deposit.paid ? (
                  <div className="px-8 py-4 bg-green-50 text-green-600 rounded-2xl font-black text-[12px] uppercase tracking-widest text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Paid
                  </div>
                ) : (
                  <button 
                    onClick={() => initiatePayment('deposit')}
                    disabled={data.isCashfreeConfigured === false}
                    className={`w-full px-10 py-4 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl transition-all ${data.isCashfreeConfigured === false ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-secondary text-white shadow-secondary/20 hover:scale-105 active:scale-95'}`}
                  >
                    {data.isCashfreeConfigured === false ? 'Unavailable' : 'Pay Now'}
                  </button>
                )}
              </div>
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

// Add TypeScript declaration for Cashfree SDK
declare global {
  interface Window {
    Cashfree: any;
  }
}
