'use client';

import React from "react";
import { 
  Network, 
  MapPin, 
  UserPlus, 
  ShieldAlert, 
  RefreshCcw, 
  LogOut 
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PendingAssignmentPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full">
        {/* Animated Icon Header */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
          <div className="relative w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center mx-auto border border-primary/10">
            <Network size={64} className="text-primary animate-bounce-slow" />
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-secondary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
            Hierarchy Setup
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl md:text-5xl font-black text-secondary mb-6 leading-tight">
          Awaiting <span className="text-primary">Hierarchy</span> Mapping
        </h1>
        
        <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-xl mx-auto">
          You've successfully registered! Our administration team is now assigning you to the correct 
          <span className="text-secondary font-bold"> Vendor network</span> and 
          <span className="text-secondary font-bold"> Campaign area</span>.
        </p>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-soft flex flex-col items-center">
            <UserPlus className="text-green-500 mb-3" size={24} />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Registration</p>
            <p className="font-bold text-secondary">Completed</p>
          </div>
          <div className="p-6 bg-white rounded-[32px] border border-primary/20 shadow-soft flex flex-col items-center ring-4 ring-primary/5">
            <Network className="text-primary mb-3 animate-pulse" size={24} />
            <p className="text-[10px] font-black uppercase text-primary tracking-wider">Mapping</p>
            <p className="font-bold text-secondary">In Progress</p>
          </div>
          <div className="p-6 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200 flex flex-col items-center opacity-50">
            <ShieldAlert className="text-gray-400 mb-3" size={24} />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Activation</p>
            <p className="font-bold text-gray-400">Locked</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-5 bg-secondary text-white rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <RefreshCcw size={18} />
            Check Mapping Status
          </button>
          
          <button 
            onClick={handleLogout}
            className="px-8 py-5 bg-white text-gray-400 border border-gray-100 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-16 flex items-center justify-center gap-3 text-gray-400">
          <MapPin size={16} />
          <p className="text-xs font-bold uppercase tracking-widest">
            SakhiHub Network Operations Center
          </p>
        </div>
      </div>
    </div>
  );
}
