'use client';

import { useLanguage } from "@/context/LanguageContext";
import React, { useState, useEffect } from "react";
import {
  Phone, Lock, Heart, ShieldCheck, ArrowRight, ArrowLeft,
  Mail, AlertCircle, CheckCircle, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import PasswordField from "@/components/ui/PasswordField";
import { validatePassword } from "@/utils/validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(1); // 1: Email/Request, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setStep(2);
        setResendTimer(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/api/auth/resend-otp', { email, purpose: 'Password Reset' });
      if (res.data.success) {
        setResendTimer(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setStep(3); // Moving to new password step
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const passValid = validatePassword(newPassword);
    if (!passValid.isValid) {
      setError(`Weak password: ${passValid.errors.join(', ')}`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword
      });
      if (res.data.success) {
        setSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FFF5F8] overflow-hidden">
      {/* Left Side - Visual (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-secondary-dark via-secondary to-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-10 border border-white/30"
          >
            <Lock size={45} className="text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black mb-6 leading-tight"
          >
            Secure <br /> Your <span className="text-primary-dark">Account.</span>
          </motion.h1>
          <p className="text-xl opacity-80 leading-relaxed mb-12">
            Reset your password securely using multi-factor authentication.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl p-8 md:p-12 relative z-10 my-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-block text-3xl font-black text-secondary no-underline mb-6 group">
              Sakhi<span className="text-primary transition-all group-hover:pl-1">Hub</span>
            </Link>
            <h2 className="text-3xl font-black text-secondary leading-tight">Recover Password</h2>
            <p className="text-gray-400 font-bold mt-2">
              {step === 1 && "Enter your registered email to receive a reset code."}
              {step === 2 && "Enter the 6-digit code sent to your email."}
              {step === 3 && "Create a strong new password for your account."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form key="step1" {...fadeInUp} onSubmit={handleRequestOtp} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">{t("auth.forgot.emailLabel")}</label>
                  <div className="relative group">
                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-14 pr-5 py-4 md:py-5 rounded-3xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-bold text-lg"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl font-bold flex items-center gap-3 border border-red-100">
                    <AlertCircle size={18} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-5 md:py-6 justify-center text-lg shadow-2xl shadow-primary/25 mt-4 transition-all active:scale-95 disabled:opacity-50">
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                  <ArrowRight size={22} className="ml-2" />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form key="step2" {...fadeInUp} onSubmit={handleVerifyOtp} className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0 0 0 0 0 0"
                    className="w-full text-center text-4xl font-black tracking-[10px] md:tracking-[20px] py-6 rounded-3xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <button type="submit" disabled={otp.length !== 6} className="btn-primary w-full py-5 justify-center text-lg shadow-xl shadow-primary/20">
                    Continue to Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading || resendTimer > 0}
                    className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-all disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form key="step3" {...fadeInUp} onSubmit={handleResetPassword} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">{t("auth.forgot.newPassword")}</label>
                  <PasswordField
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">{t("auth.forgot.confirmPassword")}</label>
                  <PasswordField
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl font-bold flex items-center gap-3 border border-red-100">
                    <AlertCircle size={18} className="flex-shrink-0" /> {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 text-green-600 text-sm rounded-2xl font-bold flex items-center gap-3 border border-green-100">
                    <ShieldCheck size={18} className="flex-shrink-0" /> {success}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-5 md:py-6 justify-center text-lg shadow-2xl shadow-primary/25 mt-4 transition-all active:scale-95 disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Complete Reset'}
                  <Sparkles size={22} className="ml-2" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-12 text-center pt-8 border-t border-gray-50">
            <Link href="/login" className="text-gray-400 font-bold text-base hover:text-primary transition-colors flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
