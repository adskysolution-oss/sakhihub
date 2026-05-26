'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import Link from "next/link";
import { 
  FileText, ShieldCheck, Download, AlertCircle, CheckCircle, BadgeCheck, ChevronRight
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary, getRequiredDocsForUser, getDocumentViewUrl } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';
import PaymentReceiptCard from "@/components/features/dashboard/PaymentReceiptCard";

export default function SubVendorDocuments() {
  const [documents, setDocuments] = useState<any>({});
  const [vendorType, setVendorType] = useState<string>('individual');
  const [digitalCertificates, setDigitalCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const { uploading, uploadDocument } = useDocumentFlow({
    onSuccess: async () => { await fetchDocuments(); }
  });

  const handleSignedDocumentUpload = async (file: File, documentId: string) => {
    setUploadingDocId(documentId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'signed_document');
      formData.append('documentId', documentId);
      
      const res = await axios.post('/api/vendor/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDocId(null);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('/api/vendor/documents');
      if (res.data.success) {
        setDocuments(res.data.data.documents || {});
        setDigitalCertificates(res.data.data.digitalCertificates || []);
        if (res.data.data.vendorType) {
          setVendorType(res.data.data.vendorType);
        }
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

  const compliance = getDocComplianceSummary(documents, 'sub_vendor', vendorType);
  const docTypes = getRequiredDocsForUser('sub_vendor', documents, vendorType);

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
          <div className="lg:col-span-2 space-y-6">
            {docTypes.map((type) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DocumentCard 
                  type={type}
                  docInfo={documents?.[type]}
                  uploading={uploading === type}
                  onUpload={(file) => uploadDocument(file, type)}
                />
              </motion.div>
            ))}
          </div>

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
                    <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Compliance Progress</span>
                    <span className="text-2xl font-black">{Math.round((compliance.uploaded / compliance.total) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary-light transition-all duration-1000"
                      style={{ width: `${(compliance.uploaded / compliance.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-white/10 rounded-2xl text-center">
                      <p className="text-2xl font-black">{compliance.uploaded}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Uploaded</p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl text-center">
                      <p className="text-2xl font-black">{compliance.approved}</p>
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
              <h5 className="text-sm font-black text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-primary" /> Security Note
              </h5>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">
                Your data is stored securely using enterprise-grade encryption. We only use these documents for government compliance and NGO verification purposes.
              </p>
            </div>

            <PaymentReceiptCard />

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
              <h2 className="text-xl font-black text-secondary mb-6">Digital Certificates</h2>
              <div className="flex flex-col gap-3">
                <Link 
                  href="/id-card"
                  className="flex items-center justify-between p-5 bg-primary/5 hover:bg-primary hover:text-white rounded-3xl transition-all group text-left border border-primary/20"
                >
                  <div className="flex items-center gap-4">
                    <BadgeCheck size={20} className="text-primary group-hover:text-white" />
                    <span className="font-bold text-sm">Digital ID Card (Live View)</span>
                  </div>
                  <ChevronRight size={18} className="opacity-40 group-hover:opacity-100" />
                </Link>
                {[
                  { id: 'auth_letter', title: 'Appointment & Agreement Letter', icon: FileText },
                  { id: 'vendor_code_cert', title: 'Sub-Vendor Certificate', icon: ShieldCheck }
                ].map((expectedCert, idx) => {
                  const certData = digitalCertificates.find(c => c.type === expectedCert.id);
                  if (certData && certData.visibleToVendor !== false) {
                    return (
                      <a 
                        key={idx}
                        href={certData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 bg-green-50 hover:bg-green-600 hover:text-white rounded-3xl transition-all group text-left border border-green-100"
                      >
                        <div className="flex items-center gap-4">
                          <expectedCert.icon size={20} className="text-green-600 group-hover:text-white" />
                          <span className="font-bold text-sm">{certData.title || expectedCert.title}</span>
                        </div>
                        <Download size={18} className="opacity-40 group-hover:opacity-100" />
                      </a>
                    );
                  } else {
                    return (
                      <div key={idx} className="flex items-center justify-between p-5 bg-red-50 rounded-3xl border border-red-100 text-left opacity-75 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <expectedCert.icon size={20} className="text-red-400" />
                          <div>
                            <span className="font-bold text-sm text-red-800 line-through decoration-red-300">{expectedCert.title}</span>
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                              <AlertCircle size={12} /> Not Generated Yet
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>

            {digitalCertificates.some(c => c.type === 'auth_letter' && c.visibleToVendor !== false) && (
              <div className="bg-green-50 p-6 rounded-[32px] border border-green-100 flex flex-col sm:flex-row justify-between items-center text-left shadow-sm gap-4 mt-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-green-800">Agreement Generated Successfully</h3>
                    <p className="text-xs text-green-600 font-bold mt-1">
                      ID: {digitalCertificates.find(c => c.type === 'auth_letter')?.agreementId || 'N/A'} • {new Date(digitalCertificates.find(c => c.type === 'auth_letter')?.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(() => {
              const authLetter = digitalCertificates.find(c => c.type === 'auth_letter');
              if (!authLetter) return null;

              const isLocked = authLetter.isLocked;
              const hasUploaded = !!authLetter.uploadedDocumentUrl;
              
              return (
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft mt-8">
                  <h2 className="text-xl font-black text-secondary mb-6 flex items-center gap-2">
                    <FileText size={24} className="text-primary" /> Signed Agreement Upload
                  </h2>
                  <p className="text-xs text-gray-400 font-bold mb-6 leading-relaxed">
                    Please download your <span className="text-primary">Appointment & Agreement Letter</span> from the Digital Certificates section above, sign it physically or digitally, and upload the scanned copy here.
                  </p>
                  
                  {hasUploaded ? (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isLocked ? 'bg-green-500' : 'bg-primary'}`}>
                            {isLocked ? <ShieldCheck size={20} /> : <FileText size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-secondary">Signed Agreement Uploaded</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                              Status: {isLocked ? 'Approved & Locked' : authLetter.status}
                            </p>
                          </div>
                        </div>
                        <a href={getDocumentViewUrl(authLetter.uploadedDocumentUrl)} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-primary rounded-xl shadow-sm hover:bg-primary hover:text-white border border-gray-100 transition-all">
                          <Download size={16} />
                        </a>
                      </div>
                      
                      {!isLocked ? (
                        <label className={`w-full py-3 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest cursor-pointer transition-all border-2 border-primary/20 text-primary hover:bg-primary/5 ${uploadingDocId === authLetter._id ? 'opacity-50 cursor-wait' : ''}`}>
                          {uploadingDocId === authLetter._id ? 'Uploading...' : 'Replace Signed Document'}
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploadingDocId === authLetter._id} onChange={(e) => { if(e.target.files?.[0]) handleSignedDocumentUpload(e.target.files[0], authLetter._id); }} />
                        </label>
                      ) : (
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-2">
                          <CheckCircle size={12} /> Document verified and locked
                        </p>
                      )}
                    </div>
                  ) : (
                    <label className={`w-full py-4 bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest cursor-pointer transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 ${uploadingDocId === authLetter._id ? 'opacity-50 cursor-wait' : ''}`}>
                      {uploadingDocId === authLetter._id ? 'Uploading...' : 'Upload Signed Agreement'}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" disabled={uploadingDocId === authLetter._id} onChange={(e) => { if(e.target.files?.[0]) handleSignedDocumentUpload(e.target.files[0], authLetter._id); }} />
                    </label>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
