'use client';

import React, { useState, useEffect, Suspense } from "react";
import { Phone, Lock, Heart, ShieldCheck, Users, Briefcase, AlertCircle, Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Heart as HeartIcon,
  ShieldCheck as ShieldIcon,
  Briefcase as BriefIcon,
  Users as UsersIcon,
  Sparkles as SparkleIcon,
  ArrowRight as ArrowIcon,
  ChevronRight as ChevronIcon,
  Lock as LockIcon,
  AlertCircle as AlertIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon
} from "lucide-react";
import PasswordField from "@/components/ui/PasswordField";
import { useLanguage } from "@/context/LanguageContext";

type Role = 'member' | 'employee' | 'vendor' | 'sub_vendor';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [role, setRole] = useState<Role>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    // If redirected here with an admin callbackUrl, send to admin login page
    const callbackUrl = searchParams.get('callbackUrl');
    if (callbackUrl && callbackUrl.startsWith('/admin')) {
      router.replace(`/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    if (searchParams.get('registered')) {
      setSuccess(t('auth.login.registrationSuccess'));
    }
  }, [searchParams, router, t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post('/api/auth/login', {
        ...formData,
        role: role,
      });

      if (response.data.success) {
        const user = response.data.data;
        const callbackUrl = searchParams.get('callbackUrl');

        if (callbackUrl) {
          window.location.href = decodeURIComponent(callbackUrl);
          return;
        }

        if (user.role === 'super_admin') window.location.href = '/admin/dashboard';
        else if (user.role === 'vendor') window.location.href = '/vendor/dashboard';
        else if (user.role === 'sub_vendor') window.location.href = '/sub-vendor/dashboard';
        else if (user.role === 'employee') window.location.href = '/employee/dashboard';
        else window.location.href = '/member/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
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
            <HeartIcon size={45} fill="white" className="drop-shadow-lg" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black mb-6 leading-tight"
          >
            {t('auth.login.title')} <br /> {t('auth.login.subtitle')} <span className="text-primary-dark">{t('auth.login.highlight')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl opacity-80 leading-relaxed mb-12"
          >
            {t('auth.login.description')}
          </motion.p>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-black/10">
                <ShieldIcon size={28} />
              </div>
              <div>
                <p className="font-black text-lg">{t('auth.login.secureAccess')}</p>
                <p className="text-xs opacity-60">{t('auth.login.secureAccessDesc')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-y-auto">
        {/* Mobile Header Decor */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-[220px] bg-gradient-to-br from-secondary to-primary z-0 rounded-b-[40px] shadow-2xl overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl p-8 md:p-12 relative z-10 my-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-block text-3xl font-black text-secondary no-underline mb-6 group">
              Sakhi<span className="text-primary transition-all group-hover:pl-1">Hub</span>
            </Link>
            <h2 className="text-3xl md:text-4xl font-black text-secondary leading-tight">{t('auth.login.memberPortal')}</h2>
            <p className="text-gray-400 font-bold mt-2">{t('auth.login.welcomeBack')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10 p-1.5 bg-gray-50 rounded-3xl border border-gray-100">
            {(['member', 'employee', 'vendor', 'sub_vendor'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all duration-300 font-black text-[10px] uppercase tracking-wider ${role === r ? 'bg-white text-primary shadow-xl shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {r === 'employee' ? <BriefIcon size={14} /> : r === 'vendor' ? <ShieldIcon size={14} /> : r === 'sub_vendor' ? <SparkleIcon size={14} /> : <UsersIcon size={14} />}
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-2">{t('auth.login.emailLabel')}</label>
              <div className="relative group">
                <ShieldIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="w-full pl-14 pr-5 py-4 md:py-5 rounded-2xl md:rounded-3xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all font-bold text-lg"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{t('auth.login.passwordLabel')}</label>
                <Link href="/forgot" className="text-xs text-primary font-black hover:underline">{t('auth.login.forgotPassword')}</Link>
              </div>
              <PasswordField
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.login.passwordPlaceholder')}
                required
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 text-red-500 text-sm rounded-2xl font-bold flex items-center gap-3 border border-red-100"
                >
                  <AlertIcon size={18} className="flex-shrink-0" /> {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-green-50 text-green-600 text-sm rounded-2xl font-bold flex items-center gap-3 border border-green-100"
                >
                  <ShieldIcon size={18} className="flex-shrink-0" /> {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 md:py-6 justify-center text-lg shadow-2xl shadow-primary/25 mt-4 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? t('auth.login.verifying') : `${t('auth.login.loginAs')} ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              {!loading && <ArrowIcon size={22} className="ml-2" />}
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-gray-50">
            <p className="text-gray-400 font-bold text-base">
              {t('auth.login.newTo')}
              <Link href="/register" className="text-primary hover:text-secondary transition-colors ml-2 border-b-2 border-primary/20 hover:border-primary">{t('auth.login.createAccount')}</Link>
            </p>
            <div className="mt-6">
              <Link href="/admin/login" className="text-xs text-gray-300 font-bold uppercase tracking-widest hover:text-secondary flex items-center justify-center gap-2">
                {t('auth.login.adminAccess')} <ChevronIcon size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFF5F8] text-primary font-black">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
