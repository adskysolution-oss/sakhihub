'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-900/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 md:p-12 rounded-[32px] text-center shadow-2xl flex flex-col items-center">
        {/* Shield Icon Container */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 p-0.5 shadow-lg shadow-red-950/40 mb-8 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-white tracking-tight md:text-4xl mb-4 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed max-w-sm mb-10">
          You do not have the required territory scoping or system permissions to view this resource. 
          If you believe this is an error, please contact your Super Admin.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-800/60 hover:bg-slate-800 text-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 border border-slate-700/50"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-950/20"
          >
            <Home size={14} /> Dashboard Home
          </button>
        </div>
      </div>
    </div>
  );
}
