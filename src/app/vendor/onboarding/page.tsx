'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, Clock, LogOut, AlertCircle, FileCheck
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary, getRequiredDocs } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';

export default function VendorOnboarding() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vendorType, setVendorType] = useState<string>('');
  const [savingType, setSavingType] = useState(false);

  useEffect(() => {
    if (profile && !vendorType) {
      setVendorType(profile.vendorType || 'individual');
    }
  }, [profile, vendorType]);

  const handleUpdateVendorType = async (type: string) => {
    setVendorType(type);
    setSavingType(true);
    try {
      const res = await axios.put('/api/auth/me', { vendorType: type });
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setVendorType(profile?.vendorType || 'individual');
    } finally {
      setSavingType(false);
    }
  };

  const { uploading, uploadDocument } = useDocumentFlow({
    onSuccess: async () => { await fetchProfile(); }
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/auth/me?_t=${Date.now()}`);
      if (res.data.success) {
        const user = res.data.data;
        setProfile(user);
        
        // Real-time Auto Redirect Logic
        if (user.documentsVerified) {
          if (!user.paymentCompleted) {
            router.push('/payment-pending');
          } else if (user.dashboardAccess) {
            router.push('/vendor/dashboard');
          }
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
    const interval = setInterval(fetchProfile, 5000);
    return () => clearInterval(interval);
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

  const activeVendorType = vendorType || profile?.vendorType || 'individual';
  const compliance = getDocComplianceSummary(profile?.documents, 'vendor', activeVendorType);
  const docTypes = getRequiredDocs('vendor', activeVendorType);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <header className="bg-white border-b border-gray-100 py-6 sticky top-0 z-30">
        <div className="container flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">S</div>
            <div>
              <h1 className="text-lg font-black text-secondary tracking-tight">SakhiHub Vendor</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verification Portal</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container max-w-5xl mt-12 px-4">
        {profile && <OnboardingStepper user={profile} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
              <h3 className="text-xl font-black text-secondary mb-2">Select Vendor Entity Type</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">This determines which documents and KYC details are required for your organization.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'individual', title: 'Individual Vendor', desc: 'Proprietor, freelancer, or single contractor' },
                  { id: 'company', title: 'Company Vendor', desc: 'Private Limited, LLP, Partnership or Sole Proprietorship' },
                  { id: 'ngo_trust', title: 'NGO / Trust Vendor', desc: 'Non-governmental organization, Society, or Trust' }
                ].map(type => (
                  <div 
                    key={type.id}
                    onClick={() => handleUpdateVendorType(type.id)}
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${vendorType === type.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                  >
                    <div>
                      <h4 className="font-black text-secondary text-sm">{type.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-1">{type.desc}</p>
                    </div>
                    {savingType && vendorType === type.id && (
                      <span className="text-[9px] text-primary font-black uppercase tracking-widest mt-2">Saving...</span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-black text-secondary mb-2">Complete Verification</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Please upload high-quality scans (PDF, JPG, PNG, WEBP) of the following documents</p>
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
          </div>

          <div className="space-y-8">
            <div className="bg-secondary-dark p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
               <h4 className="text-2xl font-black mb-6 relative z-10">Verification Status</h4>
               
               <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${compliance.uploaded === compliance.total ? 'bg-green-500' : 'bg-white/10'}`}>
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Documents</p>
                      <p className="font-bold text-sm">{compliance.uploaded === compliance.total ? 'All Uploaded' : 'Pending Uploads'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${['documents_uploaded', 'under_review'].includes(profile?.status) ? 'bg-amber-500 animate-pulse' : profile?.status === 'reupload_required' ? 'bg-red-500' : profile?.status === 'approved' ? 'bg-green-500' : 'bg-white/10'}`}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Review Process</p>
                      <p className="font-bold text-sm">
                        {profile?.status === 'documents_uploaded' ? 'Documents Submitted' :
                         profile?.status === 'under_review' ? 'In Progress' :
                         profile?.status === 'reupload_required' ? 'Re-upload Required' :
                         profile?.status === 'approved' ? 'Compliance Approved' :
                         profile?.status === 'active' ? 'Account Active' :
                         'Waiting for Upload'}
                      </p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${['active', 'approved'].includes(profile?.status) ? 'bg-green-500' : 'bg-white/10'}`}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Final Approval</p>
                      <p className="font-bold text-sm">{['active', 'approved'].includes(profile?.status) ? 'Access Granted' : 'Pending Approval'}</p>
                    </div>
                 </div>
               </div>

               <div className="mt-12 pt-8 border-t border-white/10 relative z-10 text-center">
                 <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                   {profile?.status === 'approved' ? 
                     'All documents verified! Please wait for final manual activation by our administrator to access your dashboard.' :
                     'Once all documents are uploaded, our compliance team will verify your organization within 24-48 business hours.'}
                 </p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100">
              <h5 className="text-sm font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-primary" /> Security Note
              </h5>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">
                Your data is stored securely using enterprise-grade encryption. We only use these documents for government compliance and NGO verification purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
