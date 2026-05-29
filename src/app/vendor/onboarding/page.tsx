'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, LogOut, AlertCircle, FileCheck,
  UserCheck, CreditCard, Landmark, Upload, FileText
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { getDocComplianceSummary, getRequiredDocs, getDocumentViewUrl, getRequiredDocsForUser } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';
import { toast } from 'sonner';

export default function VendorOnboarding() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vendorType, setVendorType] = useState<string>('');
  const [savingType, setSavingType] = useState(false);
  const [exceptionModal, setExceptionModal] = useState({ show: false, type: '', reason: '' });

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
  const [isInitialized, setIsInitialized] = useState(false);

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
        setIsInitialized(false); // force re-sync of forms
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setVendorType(profile?.vendorType || 'individual');
    } finally {
      setSavingType(false);
    }
  };

  const { uploading, uploadDocument, handleExceptionRequest } = useDocumentFlow({
    onSuccess: async () => {
      setIsInitialized(false);
      await fetchProfile();
    }
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

  const submitAadhaar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12) {
      toast.error("Please enter a valid 12-digit Aadhaar Number before uploading.");
      e.target.value = '';
      return;
    }
    await uploadDocument(file, aadhaarDocType, { aadhaarNumber: formData.aadhaarNumber });
    e.target.value = '';
  };

  const submitAadhaarSplit = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back', type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12) {
      toast.error("Please enter a valid 12-digit Aadhaar Number before uploading.");
      e.target.value = '';
      return;
    }
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
    await uploadDocument(file, panDocType, { panNumber: formData.panNumber });
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

  const activeVendorType = vendorType || profile?.vendorType || 'individual';
  const compliance = getDocComplianceSummary(profile?.documents, 'vendor', activeVendorType);
  const docTypes = getRequiredDocsForUser('vendor', profile?.documents, activeVendorType);

  const aadhaarDocType = docTypes.find(d => ['aadhaarCard', 'directorAadhaarCard', 'aadhaarCardFront', 'aadhaarCardBack', 'directorAadhaarCardFront', 'directorAadhaarCardBack'].includes(d)) || 'aadhaarCard';
  const panDocType = docTypes.find(d => ['panCard', 'companyPanCard', 'directorPanCard', 'ngoPanCard'].includes(d)) || 'panCard';
  const bankDocType = 'bankPassbook';
  const generalDocTypes = docTypes.filter(d =>
    !['aadhaarCard', 'directorAadhaarCard', 'aadhaarCardFront', 'aadhaarCardBack', 'directorAadhaarCardFront', 'directorAadhaarCardBack'].includes(d) &&
    d !== panDocType &&
    d !== bankDocType
  );

  const renderUploadedDocState = (docInfo: any, reuploadInput?: React.ReactNode) => {
    if (!docInfo) return null;
    if (!docInfo.url && !['exception_requested', 'on_hold', 'exception_responded', 'exception_approved'].includes(docInfo.status)) return null;
    return (
      <div className="mt-4 flex flex-col gap-3 bg-white/70 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {docInfo.status === 'exception_requested' || docInfo.status === 'on_hold' || docInfo.status === 'exception_responded' ? (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-100 text-amber-600">Exception</span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">Uploaded</span>
              )}
              {docInfo.status === 'approved' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">Approved</span>}
              {docInfo.status === 'rejected' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-600">Rejected</span>}
              {docInfo.status === 'exception_approved' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">Exception Approved</span>}
            </div>
            {docInfo.fileName && <p className="text-sm font-black text-secondary truncate">{docInfo.fileName}</p>}
            {docInfo.exceptionReason && <p className="text-xs font-bold text-amber-700 italic mt-1">"{docInfo.exceptionReason}"</p>}
            {docInfo.uploadedAt && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Uploaded {new Date(docInfo.uploadedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
          {docInfo.url && (
            <a href={getDocumentViewUrl(docInfo.url)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Preview
            </a>
          )}
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
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Please fill all details and upload valid document scans.</p>
            </section>

            <div className="space-y-6">
              {/* Aadhaar Card Custom Box */}
              {(docTypes.includes('aadhaarCard') || docTypes.includes('directorAadhaarCard') || docTypes.includes('aadhaarCardFront') || docTypes.includes('directorAadhaarCardFront')) && (() => {
                const isSplit = docTypes.includes('aadhaarCardFront') || docTypes.includes('directorAadhaarCardFront');
                const frontType = docTypes.includes('directorAadhaarCardFront') ? 'directorAadhaarCardFront' : 'aadhaarCardFront';
                const backType = docTypes.includes('directorAadhaarCardBack') ? 'directorAadhaarCardBack' : 'aadhaarCardBack';
                const activeAadhaarKey = isSplit ? frontType : aadhaarDocType;
                const isApproved = isSplit
                  ? (profile?.documents?.[frontType]?.status === 'approved' || profile?.documents?.[backType]?.status === 'approved')
                  : profile?.documents?.[aadhaarDocType]?.status === 'approved';

                return (
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
                          readOnly={isApproved}
                        />
                      </div>

                      {isSplit ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-xs font-black text-secondary mb-3">Front Side</p>
                            {profile?.documents?.[frontType]?.url ? (
                              renderUploadedDocState(profile.documents[frontType], (
                                <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                                  {uploading === frontType ? 'Uploading...' : 'Re-upload'}
                                  <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === frontType} onChange={(e) => submitAadhaarSplit(e, 'front', frontType)} />
                                </label>
                              ))
                            ) : (
                              <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                                {uploading === frontType ? 'Uploading...' : <><Upload size={14} /> Upload Front</>}
                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === frontType} onChange={(e) => submitAadhaarSplit(e, 'front', frontType)} />
                              </label>
                            )}
                          </div>
                          <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-xs font-black text-secondary mb-3">Back Side</p>
                            {profile?.documents?.[backType]?.url ? (
                              renderUploadedDocState(profile.documents[backType], (
                                <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                                  {uploading === backType ? 'Uploading...' : 'Re-upload'}
                                  <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === backType} onChange={(e) => submitAadhaarSplit(e, 'back', backType)} />
                                </label>
                              ))
                            ) : (
                              <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                                {uploading === backType ? 'Uploading...' : <><Upload size={14} /> Upload Back</>}
                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === backType} onChange={(e) => submitAadhaarSplit(e, 'back', backType)} />
                              </label>
                            )}
                            {(!profile?.documents?.[backType] || (!profile.documents[backType].url && !['exception_requested', 'on_hold', 'exception_responded', 'exception_approved'].includes(profile.documents[backType].status))) && (
                              <button onClick={() => setExceptionModal({ show: true, type: backType, reason: '' })} className="w-full text-xs font-black text-gray-400 hover:text-amber-600 hover:underline uppercase tracking-widest text-center mt-3">Don't have this document?</button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-xs font-black text-secondary mb-3">Aadhaar Document</p>
                          {profile?.documents?.[aadhaarDocType]?.url ? (
                            renderUploadedDocState(profile.documents[aadhaarDocType], (
                              <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                                {uploading === aadhaarDocType ? 'Uploading...' : 'Re-upload'}
                                <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === aadhaarDocType} onChange={submitAadhaar} />
                              </label>
                            ))
                          ) : (
                            <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                              {uploading === aadhaarDocType ? 'Uploading...' : <><Upload size={14} /> Upload Aadhaar</>}
                              <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === aadhaarDocType} onChange={submitAadhaar} />
                            </label>
                          )}
                          {(!profile?.documents?.[aadhaarDocType] || (!profile.documents[aadhaarDocType].url && !['exception_requested', 'on_hold', 'exception_responded', 'exception_approved'].includes(profile.documents[aadhaarDocType].status))) && (
                            <button onClick={() => setExceptionModal({ show: true, type: aadhaarDocType, reason: '' })} className="w-full text-xs font-black text-gray-400 hover:text-amber-600 hover:underline uppercase tracking-widest text-center mt-3">Don't have this document?</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* PAN Card Custom Box */}
              {docTypes.includes(panDocType) && (
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
                        readOnly={profile?.documents?.[panDocType]?.status === 'approved'}
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs font-black text-secondary mb-3">PAN Document</p>
                      {profile?.documents?.[panDocType]?.url ? (
                        renderUploadedDocState(profile.documents[panDocType], (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === panDocType ? 'Uploading...' : 'Re-upload'}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === panDocType} onChange={submitPan} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === panDocType ? 'Uploading...' : <><Upload size={14} /> Upload PAN</>}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === panDocType} onChange={submitPan} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Custom Box */}
              {docTypes.includes(bankDocType) && (
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
                          readOnly={profile?.documents?.[bankDocType]?.status === 'approved'}
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
                            readOnly={profile?.documents?.[bankDocType]?.status === 'approved'}
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
                          readOnly={profile?.documents?.[bankDocType]?.status === 'approved'}
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
                          readOnly={profile?.documents?.[bankDocType]?.status === 'approved'}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 mt-4">
                      <p className="text-xs font-black text-secondary mb-3">Upload Passbook / Cheque</p>
                      {profile?.documents?.[bankDocType]?.url ? (
                        renderUploadedDocState(profile.documents[bankDocType], (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === bankDocType ? 'Uploading...' : 'Re-upload'}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === bankDocType} onChange={submitBank} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === bankDocType ? 'Uploading...' : <><Upload size={14} /> Upload Document</>}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.png" disabled={uploading === bankDocType} onChange={submitBank} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* General / Other Documents Section */}
              {generalDocTypes.length > 0 && (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-xl font-black text-secondary mb-2">Other Required Certificates</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Please upload other registration and business setup documents</p>
                  </section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generalDocTypes.map((type) => (
                      <DocumentCard
                        key={type}
                        type={type}
                        docInfo={profile?.documents?.[type]}
                        uploading={uploading === type}
                        onUpload={(file) => uploadDocument(file, type)}
                        onExceptionRequest={handleExceptionRequest}
                      />
                    ))}
                  </div>
                </div>
              )}
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

        {/* Exception Modal */}
        {exceptionModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative border border-gray-100">
              <h3 className="text-lg font-black text-secondary mb-2">Request Exception</h3>
              <p className="text-xs text-gray-400 font-bold mb-6">If you don't have this document, please explain why. An admin will review your request.</p>
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 focus:bg-white mb-6 resize-none h-24"
                placeholder="E.g., Not applicable for my business..."
                value={exceptionModal.reason}
                onChange={(e) => setExceptionModal({ ...exceptionModal, reason: e.target.value })}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setExceptionModal({ show: false, type: '', reason: '' })}
                  className="flex-1 py-3 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (exceptionModal.reason.trim().length < 5) return toast.error('Please provide a valid reason');
                    handleExceptionRequest(exceptionModal.type, exceptionModal.reason.trim());
                    setExceptionModal({ show: false, type: '', reason: '' });
                  }}
                  className="flex-1 bg-amber-500 text-white py-3 font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 rounded-xl transition-all shadow-lg shadow-amber-500/30"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
