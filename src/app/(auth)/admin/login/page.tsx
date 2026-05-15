'use client';

import React, { useState } from "react";
import { ShieldCheck, Lock, Phone, AlertCircle, Sparkles, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Suspense } from "react";
import PasswordField from "@/components/ui/PasswordField";
import Link from "next/link";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post('/api/auth/login', {
        ...formData,
        role: 'admin', // Backend will allow super_admin for 'admin' role
      });

      if (response.data.success) {
        const callbackUrl = searchParams.get('callbackUrl');
        if (callbackUrl && callbackUrl.startsWith('/admin')) {
          window.location.href = decodeURIComponent(callbackUrl);
        } else {
          window.location.href = '/admin/dashboard';
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid Admin Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="relative w-full max-w-[480px] z-10">
        <div className="bg-slate-800/50 backdrop-blur-2xl p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-700/50">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-sky-500/10 rounded-3xl text-sky-400 mb-6 border border-sky-500/20 shadow-inner">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Command Center</h2>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">SakhiHub Super Admin Access</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Admin Identity</label>
              <div className="relative group">
                <ShieldCheck size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                <input
                  required
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  type="text"
                  placeholder="Email or Mobile Number"
                  className="w-full pl-14 pr-5 py-5 rounded-2xl bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/30 transition-all font-bold text-lg shadow-inner"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Secret Key</label>
              <PasswordField
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-sky-500/10 focus:border-sky-500/30"
                iconColor="text-slate-500"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Secure Login <ChevronRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-700/50 text-center">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              Back to Home Portal
            </Link>
          </div>
        </div>
        <p className="text-center mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2024 SakhiHub Infrastructure &bull; Restricted Access
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-sky-500 font-black tracking-widest uppercase text-sm">Initializing Command Center...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}

