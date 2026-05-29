'use client';

import React, { useEffect } from 'react';
import { Clock, ShieldAlert, LogOut, RefreshCw, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { useLanguage } from '@/context/LanguageContext';

export default function PendingApprovalPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Poll status every 4 seconds to detect active status
  useEffect(() => {
    if (!user) return;

    // If already active, immediately route to correct dashboard
    if (user.status === 'active') {
      const targetDashboard = 
        user.role === 'super_admin' ? '/admin/dashboard' :
        user.role === 'vendor' ? '/vendor/dashboard' :
        user.role === 'sub_vendor' ? '/sub-vendor/dashboard' :
        user.role === 'employee' ? '/employee/dashboard' :
        '/member/dashboard';
      window.location.href = targetDashboard;
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          const freshUser = res.data.data;
          if (freshUser && freshUser.status === 'active') {
            const targetDashboard = 
              freshUser.role === 'super_admin' ? '/admin/dashboard' :
              freshUser.role === 'vendor' ? '/vendor/dashboard' :
              freshUser.role === 'sub_vendor' ? '/sub-vendor/dashboard' :
              freshUser.role === 'employee' ? '/employee/dashboard' :
              '/member/dashboard';
            window.location.href = targetDashboard;
          }
        }
      } catch (err) {
        console.error("Error polling user status", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F8]">
        <RefreshCw className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl p-10 md:p-16 text-center relative z-10"
      >
        <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-amber-100">
          <Clock size={48} className="text-amber-500 animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-secondary mb-6 leading-tight">
          Approval <span className="text-primary">Pending</span>
        </h1>
        
        <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed">
          Hello, <span className="font-bold text-secondary">{user?.fullName}</span>. Your {user?.role.replace('_', ' ')} account is currently being reviewed by our administrative team. This usually takes 24-48 hours.
        </p>

        <div className="grid gap-4 mb-12">
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 text-left">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="font-black text-secondary">Verification in Progress</p>
              <p className="text-sm text-gray-400">We are validating your documents and credentials.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 text-left">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <RefreshCw size={24} />
            </div>
            <div>
              <p className="font-black text-secondary">Automatic Access</p>
              <p className="text-sm text-gray-400">Your dashboard will unlock automatically once approved.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary py-5 px-10 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
          >
            <RefreshCw size={20} /> Check Status
          </button>
          
          <button 
            onClick={logout}
            className="py-5 px-10 rounded-2xl border-2 border-gray-100 text-gray-400 font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-gray-300 font-bold uppercase tracking-widest text-xs">
          Sakhi<span className="text-primary">Hub</span> <Heart size={12} fill="currentColor" className="text-primary" /> Empowerment
        </div>
      </motion.div>
    </div>
  );
}
