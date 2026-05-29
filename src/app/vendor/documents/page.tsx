'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import {
  FileText, Upload, Clock,
  AlertCircle, ExternalLink, ShieldCheck,
  FileCheck, CreditCard, UserCheck, Landmark, ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { getDocComplianceSummary, getRequiredDocs, getDocumentViewUrl, getRequiredDocsForUser } from "@/utils/documents";
import DocumentCard from "@/components/features/dashboard/DocumentCard";
import { useDocumentFlow } from "@/hooks/useDocumentFlow";
import { toast } from 'sonner';

export default function VendorDocuments() {
  const [documents, setDocuments] = useState<any>({});
  const [digitalCertificates, setDigitalCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { uploading, uploadDocument, handleExceptionReply } = useDocumentFlow({
    onSuccess: async () => { await fetchDocuments(); }
  });
  const [vendorType, setVendorType] = useState('individual');
  const [role, setRole] = useState('vendor');

  // Form states
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    accountHolderName: '',
    ifscCode: '',
    accountNumber: '',
    confirmAccountNumber: '',
    bankName: '',
    branchName: ''
  });
  const [ifscLoading, setIfscLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const [docRes, meRes] = await Promise.all([
        axios.get('/api/vendor/documents'),
        axios.get('/api/auth/me')
      ]);
      if (docRes.data.success && meRes.data.success) {
        setDocuments(docRes.data.data.documents || {});
        setDigitalCertificates(docRes.data.data.digitalCertificates || []);

        const user = meRes.data.data;
        setVendorType(user.vendorType || 'individual');
        setRole(user.role || 'vendor');

        setFormData(prev => ({
          aadhaarNumber: user.aadhaarNumber || '',
          panNumber: user.panNumber || '',
          accountHolderName: user.bankDetails?.accountHolderName || '',
          ifscCode: user.bankDetails?.ifscCode || '',
          bankName: user.bankDetails?.bankName || '',
          branchName: user.bankDetails?.branchName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          confirmAccountNumber: user.bankDetails?.accountNumber || ''
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleIfscChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase();
    setFormData(prev => ({ ...prev, ifscCode: code }));

    if (code.length === 11) {
      setIfscLoading(true);
      try {
        const res = await axios.get(`/api/ifsc/${code}`);
        setFormData(prev => ({
          ...prev,
          bankName: res.data.BANK,
          branchName: res.data.BRANCH
        }));
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

  const docTypes = getRequiredDocsForUser(role, documents, vendorType);
  const aadhaarDocType = docTypes.find(d => ['aadhaarCard', 'directorAadhaarCard', 'aadhaarCardFront', 'aadhaarCardBack', 'directorAadhaarCardFront', 'directorAadhaarCardBack'].includes(d)) || 'aadhaarCard';
  const panDocType = docTypes.find(d => ['panCard', 'companyPanCard', 'directorPanCard', 'ngoPanCard'].includes(d)) || 'panCard';
  const bankDocType = 'bankPassbook';
  const generalDocTypes = docTypes.filter(d =>
    !['aadhaarCard', 'directorAadhaarCard', 'aadhaarCardFront', 'aadhaarCardBack', 'directorAadhaarCardFront', 'directorAadhaarCardBack'].includes(d) &&
    d !== panDocType &&
    d !== bankDocType
  );

  const uploadedCount = docTypes.filter(d => documents[d]?.url).length;
  const approvedCount = docTypes.filter(d => documents[d]?.status === 'approved').length;

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
              {docInfo.status === 'reupload_required' && <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-100 text-red-600">Re-upload Required</span>}
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-black text-secondary">Document Center</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Verify your identity and legal compliance</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              {/* Aadhaar Card Custom Box */}
              {(docTypes.includes('aadhaarCard') || docTypes.includes('directorAadhaarCard') || docTypes.includes('aadhaarCardFront') || docTypes.includes('directorAadhaarCardFront')) && (() => {
                const isSplit = docTypes.includes('aadhaarCardFront') || docTypes.includes('directorAadhaarCardFront');
                const frontType = docTypes.includes('directorAadhaarCardFront') ? 'directorAadhaarCardFront' : 'aadhaarCardFront';
                const backType = docTypes.includes('directorAadhaarCardBack') ? 'directorAadhaarCardBack' : 'aadhaarCardBack';
                const activeAadhaarKey = isSplit ? frontType : aadhaarDocType;
                const isApproved = isSplit
                  ? (documents[frontType]?.status === 'approved' || documents[backType]?.status === 'approved')
                  : documents[aadhaarDocType]?.status === 'approved';

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
                            {documents[frontType]?.url ? (
                              renderUploadedDocState(documents[frontType], (
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
                            {documents[backType]?.url ? (
                              renderUploadedDocState(documents[backType], (
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
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-xs font-black text-secondary mb-3">Aadhaar Document</p>
                          {documents[aadhaarDocType]?.url ? (
                            renderUploadedDocState(documents[aadhaarDocType], (
                              <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                                {uploading === aadhaarDocType ? 'Uploading...' : 'Re-upload'}
                                <input type="file" className="hidden" accept=".pdf" disabled={uploading === aadhaarDocType} onChange={submitAadhaar} />
                              </label>
                            ))
                          ) : (
                            <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                              {uploading === aadhaarDocType ? 'Uploading...' : <><Upload size={14} /> Upload Aadhaar PDF</>}
                              <input type="file" className="hidden" accept=".pdf" disabled={uploading === aadhaarDocType} onChange={submitAadhaar} />
                            </label>
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
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> PDF Only</p>
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
                        readOnly={documents[panDocType]?.status === 'approved'}
                      />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-xs font-black text-secondary mb-3">PAN Document</p>
                      {documents[panDocType]?.url ? (
                        renderUploadedDocState(documents[panDocType], (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === panDocType ? 'Uploading...' : 'Re-upload'}
                            <input type="file" className="hidden" accept=".pdf" disabled={uploading === panDocType} onChange={submitPan} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === panDocType ? 'Uploading...' : <><Upload size={14} /> Upload PAN PDF</>}
                          <input type="file" className="hidden" accept=".pdf" disabled={uploading === panDocType} onChange={submitPan} />
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
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5"><FileText size={12} /> Passbook or Cheque PDF</p>
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
                          readOnly={documents[bankDocType]?.status === 'approved'}
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
                            readOnly={documents[bankDocType]?.status === 'approved'}
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
                          readOnly={documents[bankDocType]?.status === 'approved'}
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
                          readOnly={documents[bankDocType]?.status === 'approved'}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 mt-4">
                      <p className="text-xs font-black text-secondary mb-3">Upload Passbook / Cheque</p>
                      {documents[bankDocType]?.url ? (
                        renderUploadedDocState(documents[bankDocType], (
                          <label className="block w-full text-center py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                            {uploading === bankDocType ? 'Uploading...' : 'Re-upload'}
                            <input type="file" className="hidden" accept=".pdf" disabled={uploading === bankDocType} onChange={submitBank} />
                          </label>
                        ))
                      ) : (
                        <label className="w-full py-3 mt-2 bg-primary text-white rounded-xl flex justify-center items-center gap-2 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-primary/20 hover:bg-primary-dark">
                          {uploading === bankDocType ? 'Uploading...' : <><Upload size={14} /> Upload Passbook PDF</>}
                          <input type="file" className="hidden" accept=".pdf" disabled={uploading === bankDocType} onChange={submitBank} />
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
                        docInfo={documents[type]}
                        uploading={uploading === type}
                        onUpload={(file) => uploadDocument(file, type)}
                        onExceptionReply={handleExceptionReply}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <h2 className="text-xl font-black">Verification Level</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Compliance</span>
                    <span className="text-2xl font-black">{Math.round((uploadedCount / docTypes.length) * 100) || 0}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary-light transition-all duration-1000"
                      style={{ width: `${(uploadedCount / docTypes.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-white/10 rounded-2xl text-center">
                      <p className="text-2xl font-black">{uploadedCount}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Uploaded</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl text-center">
                      <p className="text-2xl font-black">{approvedCount}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Approved</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/60 mt-8 font-medium leading-relaxed">
                  Your account will be fully activated for operations once all mandatory documents are verified by the Admin.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
              <h2 className="text-xl font-black text-secondary mb-6">Digital Certificates</h2>
              <div className="flex flex-col gap-3">
                {digitalCertificates.length > 0 ? digitalCertificates.map((cert) => (
                  <div key={cert._id} className="flex flex-col p-5 bg-gray-50 rounded-3xl border border-gray-100 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <ShieldCheck size={20} />
                        </div>
                        <div>
                          <span className="font-black text-secondary">{cert.title}</span>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {cert.agreementId || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${cert.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                        {cert.status === 'approved' ? 'Digitally Accepted' : 'Pending Acceptance'}
                      </span>
                    </div>

                    {cert.status !== 'approved' && cert.type === 'auth_letter' && (
                      <div className="mb-4 p-4 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" id={`accept-${cert._id}`} className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                          <span className="text-xs font-bold text-gray-600">I have read, understood, and accept all the terms and conditions outlined in the Vendor Agreement.</span>
                        </label>
                        <button
                          onClick={async () => {
                            const checkbox = document.getElementById(`accept-${cert._id}`) as HTMLInputElement;
                            if (!checkbox.checked) {
                              toast.error("Please accept the terms to continue.");
                              return;
                            }
                            try {
                              const res = await axios.post('/api/vendor/agreement/accept', { accepted: true, agreementId: cert.agreementId });
                              if (res.data.success) {
                                toast.success("Agreement Digitally Accepted!");
                                fetchDocuments();
                              }
                            } catch (err: any) {
                              toast.error(err.response?.data?.message || "Failed to accept agreement");
                            }
                          }}
                          className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                          Verify & Sign Digitally
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-2 bg-white border border-gray-200 text-gray-600 font-black text-[9px] uppercase tracking-widest rounded-xl hover:border-primary hover:text-primary transition-all"
                      >
                        Preview
                      </a>
                      <a
                        href={cert.fileUrl}
                        download
                        target="_blank"
                        className="flex-1 text-center py-2 bg-secondary text-white font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-secondary-light transition-all"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-gray-400 font-bold italic text-center py-4">No certificates issued yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
