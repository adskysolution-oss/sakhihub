'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, LogOut, FileCheck, AlertCircle, Network, Lock,
  UserCheck, CreditCard, Landmark, Upload, ChevronRight, FileText
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { REQUIRED_DOCS_BY_ROLE, getDocumentViewUrl, formatFileSize } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';
import { toast } from 'sonner';

export default function EmployeeOnboarding() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    accountHolderName: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    accountNumber: '',
    confirmAccountNumber: ''
  });
  const [ifscLoading, setIfscLoading] = useState(false);

  const { uploading, uploadDocument } = useDocumentFlow({
    onSuccess: async () => {
      setIsInitialized(false);
      await fetchProfile();
    }
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        const user = res.data.data;
        setProfile(user);

        if (['rejected', 'suspended', 'inactive'].includes(user.status)) {
          router.push('/pending-approval');
          return;
        }

        if (user.documentsVerified) {
          if (!user.paymentCompleted) {
            router.push('/payment-pending');
          } else if (user.assignmentStatus !== 'completed') {
            router.push('/pending-assignment');
          } else if (user.dashboardAccess) {
            router.push('/employee/dashboard');
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

  useEffect(() => {
    if (profile && !isInitialized) {
      setFormData({
        aadhaarNumber: profile.aadhaarNumber || '',
        panNumber: profile.panNumber || '',
        accountHolderName: profile.bankDetails?.accountHolderName || '',
        ifscCode: profile.bankDetails?.ifscCode || '',
        bankName: profile.bankDetails?.bankName || '',
        branchName: profile.bankDetails?.branchName || '',
        accountNumber: profile.bankDetails?.accountNumber || '',
        confirmAccountNumber: profile.bankDetails?.accountNumber || ''
      });
      setIsInitialized(true);
    }
  }, [profile, isInitialized]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleIfscChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, ifscCode: code }));

    if (code.length === 11) {
      setIfscLoading(true);
      try {
        const res = await axios.get(`/api/ifsc/${code}`);
        setFormData(prev => ({ ...prev, bankName: res.data.BANK, branchName: res.data.BRANCH }));
      } catch (err) {
        setFormData(prev => ({ ...prev, bankName: '', branchName: '' }));
      } finally {
        setIfscLoading(false);
      }
    } else {
      setFormData(prev => ({ ...prev, bankName: '', branchName: '' }));
    }
  };

  const submitAadhaar = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12) {
      toast.error("Please enter a valid 12-digit Aadhaar Number before uploading.");
      e.target.value = '';
      return;
    }
    const type = side === 'front' ? 'aadhaarCardFront' : 'aadhaarCardBack';
    await uploadDocument(file, type, { aadhaarNumber: formData.aadhaarNumber });
    e.target.value = '';
  };

  const submitPan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.panNumber || formData.panNumber.length !== 10) {
      toast.error("Please enter a valid 10-character PAN Number before uploading.");
      e.target.value = '';
      return;
    }
    await uploadDocument(file, 'panCard', { panNumber: formData.panNumber });
    e.target.value = '';
  };

  const submitBank = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.accountHolderName || !formData.ifscCode || !formData.accountNumber) {
      toast.error("Please fill all bank details before uploading.");
      e.target.value = '';
      return;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error("Account numbers do not match.");
      e.target.value = '';
      return;
    }
    if (!formData.bankName) {
      toast.error("Invalid IFSC code.");
      e.target.value = '';
      return;
    }
    await uploadDocument(file, 'bankPassbook', {
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      ifscCode: formData.ifscCode,
      bankName: formData.bankName,
      branchName: formData.branchName
    });
    e.target.value = '';
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isComplianceDone = profile?.documentsVerified === true;

  // Render a mini uploaded state for custom cards
  const renderUploadedDocState = (docInfo: any, reuploadInput?: React.ReactNode) => {
    if (!docInfo?.url) return null;
    return (
      <div className="mt-4 flex flex-col gap-3 bg-white/70 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">Uploaded</span>
              {docInfo.status === 'approved' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">Approved</span>}
              {docInfo.status === 'rejected' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-600">Rejected</span>}
            </div>
            <p className="text-sm font-black text-secondary truncate">{docInfo.fileName}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Uploaded {new Date(docInfo.uploadedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
          <a href={getDocumentViewUrl(docInfo.url)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            Preview
          </a>
          {docInfo.status !== 'approved' && reuploadInput && (
            <div className="flex-1">
              {reuploadInput}
            </div>
          )}
        </div>

        {docInfo?.remarks && ['rejected', 'reupload_required'].includes(docInfo.status) && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[10px] text-red-600 font-bold">
            <AlertCircle size={12} className="inline mr-1" /> {docInfo.remarks}
          </div>
        )}
      </div>
    );
  };

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
        {profile && <OnboardingStepper user={profile} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-black text-secondary mb-2">Step 1: Compliance Verification</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Please complete all fields and upload valid document scans.</p>
            </section>

            <div className="space-y-6">
              {/* Aadhaar Card Custom Box */}
              <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-secondary">Aadhaar Card Verification</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> PDF, JPG, PNG</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aadhaar Number *</label>
                    <input
                      type="text" maxLength={12} placeholder="Enter 12-digit Aadhaar Number"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary focus:bg-white"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                      readOnly={profile?.documents?.aadhaarCardFront?.status === 'approved' || profile?.documents?.aadhaarCardBack?.status === 'approved'}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs font-black text-secondary mb-3">Front Side</p>
                      {profile?.documents?.aadhaarCardFront?.url ? (
                        renderUploadedDocState(profile.documents.aadhaarCardFront, (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === 'aadhaarCardFront' ? 'Uploading...' : 'Re-upload'}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'aadhaarCardFront'} onChange={(e) => submitAadhaar(e, 'front')} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === 'aadhaarCardFront' ? 'Uploading...' : <><Upload size={14} /> Upload Front</>}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'aadhaarCardFront'} onChange={(e) => submitAadhaar(e, 'front')} />
                        </label>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs font-black text-secondary mb-3">Back Side</p>
                      {profile?.documents?.aadhaarCardBack?.url ? (
                        renderUploadedDocState(profile.documents.aadhaarCardBack, (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === 'aadhaarCardBack' ? 'Uploading...' : 'Re-upload'}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'aadhaarCardBack'} onChange={(e) => submitAadhaar(e, 'back')} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === 'aadhaarCardBack' ? 'Uploading...' : <><Upload size={14} /> Upload Back</>}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'aadhaarCardBack'} onChange={(e) => submitAadhaar(e, 'back')} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PAN Card Custom Box */}
              <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-secondary">PAN Card Verification</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> PDF, JPG, PNG</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">PAN Number *</label>
                    <input
                      type="text" maxLength={10} placeholder="Enter 10-character PAN"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 uppercase focus:outline-none focus:border-primary focus:bg-white"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      readOnly={profile?.documents?.panCard?.status === 'approved'}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs font-black text-secondary mb-3">PAN Document</p>
                    {profile?.documents?.panCard?.url ? (
                      renderUploadedDocState(profile.documents.panCard, (
                        <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                          {uploading === 'panCard' ? 'Uploading...' : 'Re-upload'}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'panCard'} onChange={submitPan} />
                        </label>
                      ))
                    ) : (
                      <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                        {uploading === 'panCard' ? 'Uploading...' : <><Upload size={14} /> Upload PAN</>}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'panCard'} onChange={submitPan} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Details Custom Box */}
              <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-secondary">Bank Details & Payout Info</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> Passbook or Cheque</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Holder Name *</label>
                      <input
                        type="text" placeholder="Name exactly as per bank records"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 uppercase focus:outline-none focus:border-primary focus:bg-white"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                        readOnly={profile?.documents?.bankPassbook?.status === 'approved'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">IFSC Code *</label>
                      <div className="relative">
                        <input
                          type="text" maxLength={11} placeholder="e.g. SBIN0001234"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 uppercase focus:outline-none focus:border-primary focus:bg-white"
                          value={formData.ifscCode}
                          onChange={handleIfscChange}
                          readOnly={profile?.documents?.bankPassbook?.status === 'approved'}
                        />
                        {ifscLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bank & Branch</label>
                      <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[46px] flex flex-col justify-center">
                        {formData.bankName ? (
                          <>
                            <span className="text-xs font-bold text-gray-800">{formData.bankName}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase">{formData.branchName}</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">Auto-fetched via IFSC</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Number *</label>
                      <input
                        type="text" placeholder="Enter Account Number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary focus:bg-white"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                        readOnly={profile?.documents?.bankPassbook?.status === 'approved'}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm Account Number *</label>
                      <input
                        type="text" placeholder="Re-enter Account Number"
                        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:bg-white ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-200 focus:border-primary focus:ring-primary'
                          }`}
                        value={formData.confirmAccountNumber}
                        onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                        readOnly={profile?.documents?.bankPassbook?.status === 'approved'}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 mt-4">
                    <p className="text-xs font-black text-secondary mb-3">Upload Passbook / Cheque</p>
                    {profile?.documents?.bankPassbook?.url ? (
                      renderUploadedDocState(profile.documents.bankPassbook, (
                        <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                          {uploading === 'bankPassbook' ? 'Uploading...' : 'Re-upload'}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'bankPassbook'} onChange={submitBank} />
                        </label>
                      ))
                    ) : (
                      <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                        {uploading === 'bankPassbook' ? 'Uploading...' : <><Upload size={14} /> Upload Document</>}
                        <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === 'bankPassbook'} onChange={submitBank} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Remaining Standard Documents (Resume, Passport Photo, Certificates) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  const extraDocs = profile?.designation === 'Block Employee' ? ['certificate12th'] : profile?.designation === 'District Coordinator' ? ['graduationCertificate'] : [];
                  return [...extraDocs, 'resume', 'passportPhoto'].map((type) => (
                    <DocumentCard
                      key={type}
                      type={type}
                      docInfo={profile?.documents?.[type]}
                      uploading={uploading === type}
                      onUpload={(file) => uploadDocument(file, type)}
                    />
                  ));
                })()}
              </div>
            </div>

            <AnimatePresence>
              {isComplianceDone && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-green-50 border border-green-100 rounded-[32px] flex items-center gap-6 mt-8"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-200">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-green-700">Verification Completed!</h3>
                    <p className="text-green-600/80 font-bold text-sm">Your documents have been approved by the administrator. We are now proceeding to Step 2.</p>
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
