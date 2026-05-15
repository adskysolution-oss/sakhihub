'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Clock, LogOut, FileCheck, AlertCircle, Network, Lock
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';

export default function EmployeeOnboarding() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { uploading, uploadDocument } = useDocumentFlow({
    onSuccess: async () => { await fetchProfile(); }
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        const user = res.data.data;
        setProfile(user);
        
        // Check restricted statuses first
        if (['rejected', 'suspended', 'inactive'].includes(user.status)) {
          router.push('/pending-approval');
          return;
        }

        // STRICT GATE: Only allow access to dashboard if both compliance and hierarchy are done
        if (user.dashboardAccess && user.documentsVerified && user.assignmentStatus === 'completed') {
          router.push('/employee/dashboard');
          return;
        }

        // Mid-flow Redirect to Hierarchy Assignment Page
        // Only trigger if documents are fully verified but hierarchy is still pending
        if (user.documentsVerified && user.assignmentStatus === 'pending') {
          router.push('/pending-assignment');
          return;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const docTypes = REQUIRED_DOCS_BY_ROLE.employee;
  
  // Use actual database flag for strict flow control
  const isComplianceDone = profile?.documentsVerified === true;

  const steps = [
    { id: 1, name: 'Registration', status: 'completed', icon: CheckCircle2 },
    { id: 2, name: 'Verification', status: isComplianceDone ? 'completed' : 'current', icon: ShieldCheck },
    { id: 3, name: 'Hierarchy', status: isComplianceDone ? 'current' : 'upcoming', icon: Network },
    { id: 4, name: 'Dashboard', status: 'upcoming', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <header className="bg-white border-b border-gray-100 py-6 sticky top-0 z-30">
        <div className="container flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">S</div>
            <div>
              <h1 className="text-lg font-black text-secondary tracking-tight">SakhiHub Employee</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verification Portal</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container max-w-5xl mt-12 px-4">
        {/* Strict Pipeline Tracker */}
        <div className="flex justify-between mb-16 relative">
          <div className="absolute top-[18px] left-0 w-full h-[2px] bg-gray-100 z-0"></div>
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-primary text-white ring-8 ring-primary/10' :
                  'bg-white text-gray-300 border-2 border-gray-100'
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} /> : step.id}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-black text-secondary mb-2">Step 1: Compliance Verification</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Please upload scans (PDF, JPG, PNG, WEBP) of the following mandatory documents</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {docTypes.map((type) => (
                <DocumentCard 
                  key={type}
                  type={type}
                  docInfo={profile?.documents?.[type]}
                  uploading={uploading === type}
                  onUpload={(file) => uploadDocument(file, type)}
                />
              ))}
            </div>
            
            <AnimatePresence>
              {isComplianceDone && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-green-50 border border-green-100 rounded-[32px] flex items-center gap-6"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-200">
                     <ShieldCheck size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-green-700">Verification Completed!</h3>
                     <p className="text-green-600/80 font-bold text-sm">Your documents have been approved by the administrator. We are now proceeding to Step 2: Hierarchy Mapping.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-8">
            <div className="bg-secondary-dark p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
               <h4 className="text-2xl font-black mb-6 relative z-10">Onboarding Status</h4>
               
               <div className="space-y-8 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isComplianceDone ? 'bg-green-500' : 'bg-primary shadow-lg shadow-primary/20'}`}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 1</p>
                      <p className="font-bold text-sm">Verification</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${profile?.assignmentStatus === 'completed' ? 'bg-green-500' : isComplianceDone ? 'bg-amber-500 animate-pulse' : 'bg-white/10'}`}>
                      <Network size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 2</p>
                      <p className="font-bold text-sm">Hierarchy Mapping</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${profile?.dashboardAccess && profile?.assignmentStatus === 'completed' ? 'bg-green-500' : 'bg-white/10'}`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 3</p>
                      <p className="font-bold text-sm">Dashboard Access</p>
                    </div>
                 </div>
               </div>

               <div className="mt-12 pt-8 border-t border-white/10 relative z-10 text-center">
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    {isComplianceDone ? 
                      'Compliance verified! Please wait for final manual activation and network assignment by our administrator.' :
                      'Our compliance team will verify your employee profile once all documents are uploaded.'}
                 </p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h5 className="text-sm font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-primary" /> Privacy Note
              </h5>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">
                Your data is encrypted and used only for organizational payroll and compliance verification.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
