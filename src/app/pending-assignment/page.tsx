'use client';

import React, { useEffect, useState } from "react";
import { 
  Network, 
  MapPin, 
  UserPlus, 
  ShieldAlert, 
  RefreshCcw, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';
import { toast } from 'sonner';

export default function PendingAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        
        // If assignment is now completed, redirect to the appropriate dashboard
        if (userData.assignmentStatus === 'completed') {
          const dashMap: any = {
            super_admin: '/admin/dashboard',
            vendor: '/vendor/dashboard',
            sub_vendor: '/sub-vendor/dashboard',
            employee: '/employee/dashboard',
            member: '/member/dashboard'
          };
          router.push(dashMap[userData.role] || '/');
          return;
        }
      }
    } catch (error) {
      console.error('Status check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    
    // Optional: Poll every 5 seconds to catch admin changes without refresh
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'approved' | 'rejected') => {
    setActionLoading(requestId);
    try {
      const res = await axios.patch('/api/member/request', { id: requestId, status });
      if (res.data.success) {
        checkStatus(); // Re-fetch user data to check if assignment is completed
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Failed to process request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
          Your documents have been verified and payments completed! Our administration team is now assigning you to the correct 
          <span className="text-secondary font-bold"> Vendor network</span> and 
          <span className="text-secondary font-bold"> Campaign area</span>.
        </p>

        {/* Unified Stepper */}
        {user && <OnboardingStepper user={user} />}

        {/* Pending Requests Section */}
        {user?.pendingRequests && user.pendingRequests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-left"
          >
            <h3 className="text-xl font-black text-secondary mb-6 px-4">Incoming Connections</h3>
            <div className="flex flex-col gap-4">
              {user.pendingRequests.map((req: any) => (
                <div key={req._id} className="bg-white p-6 md:p-8 rounded-[40px] border border-primary/20 shadow-xl shadow-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-secondary leading-tight">{req.employeeId?.fullName}</h4>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Field Hero (Employee)</p>
                      <p className="text-xs text-gray-400 font-bold mt-2">ID: {req.employeeId?.employeeId}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => handleRequestAction(req._id, 'rejected')}
                      disabled={!!actionLoading}
                      className="flex-1 md:flex-none px-8 py-4 border-2 border-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleRequestAction(req._id, 'approved')}
                      disabled={!!actionLoading}
                      className="flex-[2] md:flex-none px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {actionLoading === req._id ? 'Processing...' : 'Accept & Finish'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button 
            onClick={checkStatus}
            className="flex items-center gap-3 px-8 py-4 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-secondary/20 hover:scale-105 transition-all"
          >
            <RefreshCcw size={16} /> Check Status Now
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-8 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="mt-20 flex items-center justify-center gap-3 text-gray-300">
          <ShieldAlert size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">SakhiHub Protocol 2026</p>
        </div>
      </div>
    </div>
  );
}
