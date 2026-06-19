'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CheckCircle2, Clock, LogOut, FileCheck, AlertCircle, Lock,
  UserCheck, CreditCard, Landmark, Upload, ChevronRight, FileText
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getRequiredDocsForUser, getDocumentViewUrl, formatFileSize } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';
import OnboardingStepper from '@/components/features/onboarding/OnboardingStepper';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export default function StaffOnboarding() {
  const { t } = useLanguage();
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

  const { uploading, uploadDocument, handleExceptionRequest, handleExceptionReply } = useDocumentFlow({
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
        
        // Ensure user is staff
        if (user.role !== 'staff') {
          router.push('/login');
          return;
        }

        setProfile(user);

        if (['rejected', 'suspended', 'inactive', 'under_review'].includes(user.status) || (['active', 'approved'].includes(user.status) && !user.dashboardAccess)) {
          router.push('/pending-approval');
          return;
        }

        // Redirect if active and has dashboard access
        if (['active', 'approved'].includes(user.status) && user.dashboardAccess) {
          router.push('/portal/dashboard');
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
      toast.error(t('onboarding.errAadhaar', 'Please enter a valid 12-digit Aadhaar Number before uploading.'));
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
      toast.error(t('onboarding.errPan', 'Please enter a valid 10-character PAN Number before uploading.'));
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
      toast.error(t('onboarding.errBankFields', 'Please fill all bank details before uploading.'));
      e.target.value = '';
      return;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      toast.error(t('onboarding.errBankMatch', 'Account numbers do not match.'));
      e.target.value = '';
      return;
    }
    if (!formData.bankName) {
      toast.error(t('onboarding.errIfsc', 'Invalid IFSC code.'));
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

  const requiredDocs = profile ? getRequiredDocsForUser(profile.role, profile.documents, undefined, profile.designation, profile.currentAddressSameAsAadhaar) : [];
  const uploadedDocs = profile ? Object.keys(profile.documents || {}).filter(key => !!profile.documents[key]?.url) : [];
  const allUploaded = requiredDocs.every(doc => uploadedDocs.includes(doc));
  
  const isComplianceDone = profile?.documentsVerified === true;
  
  const showAadhaar = requiredDocs.includes('aadhaarCardFront') || requiredDocs.includes('aadhaarCardBack');
  const showPan = requiredDocs.includes('panCard');
  const showBank = requiredDocs.includes('bankPassbook');

  // Filter other docs for the grid
  const coreDocTypes = ['aadhaarCardFront', 'aadhaarCardBack', 'panCard', 'bankPassbook'];
  const gridDocs = requiredDocs.filter(docType => !coreDocTypes.includes(docType));

  // Render a mini uploaded state for custom cards
  const renderUploadedDocState = (docInfo: any, reuploadInput?: React.ReactNode) => {
    if (!docInfo?.url) return null;
    return (
      <div className="mt-4 flex flex-col gap-3 bg-white/70 p-3 rounded-2xl border border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">{t('onboarding.uploaded', 'Uploaded')}</span>
              {docInfo.status === 'approved' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-green-100 text-green-600">{t('status.approved', 'Approved')}</span>}
              {docInfo.status === 'rejected' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-600">{t('status.rejected', 'Rejected')}</span>}
              {docInfo.status === 'under_review' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 text-blue-600">{t('status.under_review', 'Under Review')}</span>}
            </div>
            <p className="text-sm font-black text-secondary truncate">{docInfo.fileName}</p>
            {docInfo.uploadedAt && (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {t('onboarding.uploadedAt', 'Uploaded {{date}}', { date: new Date(docInfo.uploadedAt).toLocaleString() })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
          <a href={getDocumentViewUrl(docInfo.url)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            {t('onboarding.preview', 'Preview')}
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
              <h1 className="text-lg font-black text-secondary tracking-tight">
                {profile?.designation || t('onboarding.staffTitle', 'SakhiHub Staff')}
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('onboarding.portalSubtitle', 'Verification Portal')}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-all">
            <LogOut size={16} /> {t('dashboardCommon.logout', 'Logout')}
          </button>
        </div>
      </header>

      <main className="container max-w-5xl mt-12 px-4">
        {profile && <OnboardingStepper user={profile} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-3xl font-black text-secondary mb-2">{t('onboarding.step1Title', 'Step 1: Compliance Verification')}</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                {isComplianceDone 
                  ? t('onboarding.staffComplianceApproved', 'Your documents have been approved by the administrator.')
                  : t('onboarding.step1Desc', 'Please complete all fields and upload valid document scans.')}
              </p>
            </section>

            <div className="space-y-6">
              {/* Aadhaar Card Custom Box */}
              {showAadhaar && (
                <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-secondary">{t('onboarding.aadhaarTitle', 'Aadhaar Card Verification')}</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> PDF, JPG, PNG, WEBP</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.aadhaarNumber', 'Aadhaar Number *')}</label>
                      <input
                        type="text" maxLength={12} placeholder={t('onboarding.aadhaarPlaceholder', 'Enter 12-digit Aadhaar Number')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary focus:bg-white"
                        value={formData.aadhaarNumber}
                        onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value.replace(/\D/g, '') })}
                        readOnly={profile?.documents?.aadhaarCardFront?.status === 'approved' || profile?.documents?.aadhaarCardBack?.status === 'approved' || isComplianceDone}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xs font-black text-secondary mb-3">{t('onboarding.frontSide', 'Front Side')}</p>
                        {profile?.documents?.aadhaarCardFront?.url ? (
                          renderUploadedDocState(profile.documents.aadhaarCardFront, (
                            <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                              {uploading === 'aadhaarCardFront' ? t('common.uploading', 'Uploading...') : t('onboarding.reupload', 'Re-upload')}
                              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'aadhaarCardFront' || isComplianceDone} onChange={(e) => submitAadhaar(e, 'front')} />
                            </label>
                          ))
                        ) : (
                          <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                            {uploading === 'aadhaarCardFront' ? t('common.uploading', 'Uploading...') : <><Upload size={14} /> {t('onboarding.uploadFront', 'Upload Front')}</>}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'aadhaarCardFront' || isComplianceDone} onChange={(e) => submitAadhaar(e, 'front')} />
                          </label>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xs font-black text-secondary mb-3">{t('onboarding.backSide', 'Back Side')}</p>
                        {profile?.documents?.aadhaarCardBack?.url ? (
                          renderUploadedDocState(profile.documents.aadhaarCardBack, (
                            <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                              {uploading === 'aadhaarCardBack' ? t('common.uploading', 'Uploading...') : t('onboarding.reupload', 'Re-upload')}
                              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'aadhaarCardBack' || isComplianceDone} onChange={(e) => submitAadhaar(e, 'back')} />
                            </label>
                          ))
                        ) : (
                          <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                            {uploading === 'aadhaarCardBack' ? t('common.uploading', 'Uploading...') : <><Upload size={14} /> {t('onboarding.uploadBack', 'Upload Back')}</>}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'aadhaarCardBack' || isComplianceDone} onChange={(e) => submitAadhaar(e, 'back')} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAN Card Custom Box */}
              {showPan && (
                <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-secondary">{t('onboarding.panTitle', 'PAN Card Verification')}</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> PDF, JPG, PNG, WEBP</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.panNumber', 'PAN Number *')}</label>
                      <input
                        type="text" maxLength={10} placeholder={t('onboarding.panPlaceholder', 'Enter 10-character PAN')}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 uppercase focus:outline-none focus:border-primary focus:bg-white"
                        value={formData.panNumber}
                        onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                        readOnly={profile?.documents?.panCard?.status === 'approved' || isComplianceDone}
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs font-black text-secondary mb-3">{t('onboarding.panDoc', 'PAN Document')}</p>
                      {profile?.documents?.panCard?.url ? (
                        renderUploadedDocState(profile.documents.panCard, (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === 'panCard' ? t('common.uploading', 'Uploading...') : t('onboarding.reupload', 'Re-upload')}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'panCard' || isComplianceDone} onChange={submitPan} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === 'panCard' ? t('common.uploading', 'Uploading...') : <><Upload size={14} /> {t('onboarding.uploadPan', 'Upload PAN')}</>}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'panCard' || isComplianceDone} onChange={submitPan} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Custom Box */}
              {showBank && (
                <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Landmark size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-secondary">{t('onboarding.bankTitle', 'Bank Details & Payout Info')}</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> {t('onboarding.passbookCheque', 'Passbook or Cheque')}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.bankHolder', 'Account Holder Name *')}</label>
                        <input
                          type="text" placeholder={t('onboarding.bankHolderPlaceholder', 'Name exactly as per bank records')}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 uppercase focus:outline-none focus:border-primary focus:bg-white"
                          value={formData.accountHolderName}
                          onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value.toUpperCase() })}
                          readOnly={profile?.documents?.bankPassbook?.status === 'approved' || isComplianceDone}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.ifscCode', 'IFSC Code *')}</label>
                        <div className="relative">
                          <input
                            type="text" maxLength={11} placeholder={t('onboarding.ifscPlaceholder', 'e.g. SBIN0001234')}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 uppercase focus:outline-none focus:border-primary focus:bg-white"
                            value={formData.ifscCode}
                            onChange={handleIfscChange}
                            readOnly={profile?.documents?.bankPassbook?.status === 'approved' || isComplianceDone}
                          />
                          {ifscLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.bankBranch', 'Bank & Branch')}</label>
                        <div className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 min-h-[46px] flex flex-col justify-center">
                          {formData.bankName ? (
                            <>
                              <span className="text-xs font-bold text-gray-800">{formData.bankName}</span>
                              <span className="text-[9px] font-bold text-gray-500 uppercase">{formData.branchName}</span>
                            </>
                          ) : (
                            <span className="text-xs font-bold text-gray-400">{t('onboarding.ifscAutoFetch', 'Auto-fetched via IFSC')}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.bankAccount', 'Account Number *')}</label>
                        <input
                          type="text" placeholder={t('onboarding.bankAccountPlaceholder', 'Enter Account Number')}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-primary focus:bg-white"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                          readOnly={profile?.documents?.bankPassbook?.status === 'approved' || isComplianceDone}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('onboarding.bankAccountConfirm', 'Confirm Account Number *')}</label>
                        <input
                          type="text" placeholder={t('onboarding.bankAccountConfirmPlaceholder', 'Re-enter Account Number')}
                          className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:bg-white ${formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-200 focus:border-primary focus:ring-primary'
                            }`}
                          value={formData.confirmAccountNumber}
                          onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                          readOnly={profile?.documents?.bankPassbook?.status === 'approved' || isComplianceDone}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 mt-4">
                      <p className="text-xs font-black text-secondary mb-3">{t('onboarding.uploadPassbook', 'Upload Passbook / Cheque')}</p>
                      {profile?.documents?.bankPassbook?.url ? (
                        renderUploadedDocState(profile.documents.bankPassbook, (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === 'bankPassbook' ? t('common.uploading', 'Uploading...') : t('onboarding.reupload', 'Re-upload')}
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'bankPassbook' || isComplianceDone} onChange={submitBank} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === 'bankPassbook' ? t('common.uploading', 'Uploading...') : <><Upload size={14} /> {t('onboarding.uploadDoc', 'Upload Document')}</>}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploading === 'bankPassbook' || isComplianceDone} onChange={submitBank} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Match Selection for HR Recruiter Cum Trainer */}
              {profile?.designation === 'HR Recruiter Cum Trainer' && (
                <div className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all overflow-hidden shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Landmark size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-secondary">{t('onboarding.addressMatchTitle', 'Current Address Verification')}</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest">{t('onboarding.addressMatchSubtitle', 'Please verify your current physical address.')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-700">
                      {t('onboarding.isAddressSameQuestion', 'Is your current address the same as your Aadhaar address?')}
                    </p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        disabled={isComplianceDone}
                        onClick={async () => {
                          try {
                            const res = await axios.put('/api/auth/me', { currentAddressSameAsAadhaar: true });
                            if (res.data.success) {
                              setProfile((prev: any) => ({ ...prev, currentAddressSameAsAadhaar: true }));
                              toast.success(t('onboarding.addressSameSuccess', 'Address preference saved successfully'));
                            }
                          } catch (err) {
                            toast.error(t('onboarding.addressSaveError', 'Failed to update address preference'));
                          }
                        }}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${
                          profile?.currentAddressSameAsAadhaar !== false
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-primary/20'
                        }`}
                      >
                        {profile?.currentAddressSameAsAadhaar !== false && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        {t('common.yes', 'Yes')}
                      </button>
                      <button
                        type="button"
                        disabled={isComplianceDone}
                        onClick={async () => {
                          try {
                            const res = await axios.put('/api/auth/me', { currentAddressSameAsAadhaar: false });
                            if (res.data.success) {
                              setProfile((prev: any) => ({ ...prev, currentAddressSameAsAadhaar: false }));
                              toast.success(t('onboarding.addressSameSuccess', 'Address preference saved successfully'));
                            }
                          } catch (err) {
                            toast.error(t('onboarding.addressSaveError', 'Failed to update address preference'));
                          }
                        }}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${
                          profile?.currentAddressSameAsAadhaar === false
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-primary/20'
                        }`}
                      >
                        {profile?.currentAddressSameAsAadhaar === false && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        {t('common.no', 'No')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining Standard Documents dynamically loaded */}
              {gridDocs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gridDocs.map((type) => (
                    <DocumentCard
                      key={type}
                      type={type}
                      docInfo={profile?.documents?.[type]}
                      uploading={uploading === type}
                      onUpload={(file) => uploadDocument(file, type)}
                      onExceptionRequest={handleExceptionRequest}
                      onExceptionReply={handleExceptionReply}
                      readOnly={isComplianceDone}
                    />
                  ))}
                </div>
              )}
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
                    <h3 className="text-xl font-black text-green-700">{t('onboarding.completedTitle', 'Verification Completed!')}</h3>
                    <p className="text-green-600/80 font-bold text-sm">
                      {t('onboarding.staffComplianceApprovedMsg', 'Your documents have been approved by the compliance team. Please await final permission assignment and portal activation.')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-8">
            <div className="bg-secondary-dark p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
              <h4 className="text-2xl font-black mb-6 relative z-10">{t('onboarding.statusTitle', 'Onboarding Status')}</h4>

              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${allUploaded ? 'bg-green-500' : 'bg-primary shadow-lg shadow-primary/20'}`}>
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('onboarding.step1', 'Step 1')}</p>
                    <p className="font-bold text-sm">{t('onboarding.stepDocsUpload', 'Documents Upload')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isComplianceDone ? 'bg-green-500' : allUploaded ? 'bg-amber-500 animate-pulse' : 'bg-white/10'}`}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('onboarding.step2', 'Step 2')}</p>
                    <p className="font-bold text-sm">{t('onboarding.verificationStep', 'Admin Verification')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${profile?.dashboardAccess ? 'bg-green-500' : 'bg-white/10'}`}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t('onboarding.step3', 'Step 3')}</p>
                    <p className="font-bold text-sm">{t('onboarding.dashboardAccessStep', 'Dashboard Access')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 relative z-10 text-center">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {isComplianceDone ?
                    t('onboarding.staffStatusApprovedMsg', 'Compliance verified! Awaiting administrator to assign portal permissions and activate your dashboard access.') :
                    allUploaded ?
                    t('onboarding.staffStatusReviewMsg', 'Documents uploaded successfully! Our compliance team is currently reviewing your profile.') :
                    t('onboarding.staffStatusPendingMsg', 'Please upload all the required documents to submit your profile for admin verification.')}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <h5 className="text-sm font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-primary" /> {t('onboarding.privacyTitle', 'Privacy Note')}
              </h5>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">
                {t('onboarding.privacyDesc', 'Your data is encrypted and used only for organizational payroll and compliance verification.')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
