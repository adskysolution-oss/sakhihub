'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  FileText, Upload, Clock, 
  AlertCircle, Download, ExternalLink, ShieldCheck,
  FileCheck, CreditCard, UserCheck, Landmark
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

const docTypes = [
  { id: 'ngoCertificate', label: 'NGO Registration Certificate', icon: FileCheck, desc: 'Registration certificate issued by government' },
  { id: 'panCard', label: 'PAN Card', icon: CreditCard, desc: 'Organizational or Proprietor PAN card' },
  { id: 'aadhaarCard', label: 'Aadhaar Card', icon: UserCheck, desc: 'Aadhaar card of the authorized person' },
  { id: 'bankPassbook', label: 'Bank Passbook / Cheque', icon: Landmark, desc: 'Cancelled cheque or first page of passbook' },
];

const getStatusMeta = (status?: string) => {
  switch (status) {
    case 'approved':
      return { label: 'Approved', className: 'bg-green-100 text-green-600' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-red-100 text-red-600' };
    case 'reupload_required':
      return { label: 'Re-upload Required', className: 'bg-red-100 text-red-600' };
    case 'under_review':
      return { label: 'Under Review', className: 'bg-amber-100 text-amber-600' };
    case 'uploaded':
      return { label: 'Uploaded', className: 'bg-primary/10 text-primary' };
    case 'pending':
    default:
      return { label: 'Pending Upload', className: 'bg-gray-100 text-gray-400' };
  }
};

export default function VendorDocuments() {
  const [documents, setDocuments] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('/api/vendor/documents');
      if (res.data.success) {
        setDocuments(res.data.data.documents || {});
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploading === type) return;

    if (file.type !== 'application/pdf') {
      alert("Only PDF documents are accepted for verification.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB");
      return;
    }

    setUploading(type);
    try {
      const base64 = await fileToDataUrl(file);
      const res = await axios.post('/api/vendor/documents', {
        file: base64,
        type,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        mimeType: file.type,
      });

      if (res.data.success) {
        await fetchDocuments();
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const uploadedCount = docTypes.filter(d => documents[d.id]?.url).length;
  const approvedCount = docTypes.filter(d => documents[d.id]?.status === 'approved').length;

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
          {/* Document Cards — Main Area */}
          <div className="lg:col-span-2 space-y-6">
            {docTypes.map((doc) => {
              const docInfo = documents[doc.id];
              const isUploaded = !!docInfo?.url;
              const status = docInfo?.status || 'pending';
              const statusMeta = getStatusMeta(status);
              const DocIcon = doc.icon;

              return (
                <motion.div 
                  key={doc.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white p-6 md:p-8 rounded-[32px] border-2 transition-all ${
                    status === 'approved' ? 'border-green-100' :
                    status === 'rejected' || status === 'reupload_required' ? 'border-red-100' :
                    isUploaded ? 'border-primary/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      status === 'approved' ? 'bg-green-500 text-white' :
                      status === 'rejected' || status === 'reupload_required' ? 'bg-red-500 text-white' :
                      isUploaded ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <DocIcon size={28} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-secondary">{doc.label}</h3>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-bold leading-relaxed">{doc.desc}</p>

                      {isUploaded && (
                        <div className="mt-4 space-y-3">
                          <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5">
                              <FileText size={12} /> {docInfo.fileName || 'Document.pdf'}
                            </span>
                            {docInfo.fileSize && (
                              <span className="flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-gray-300 rounded-full" /> {docInfo.fileSize}
                              </span>
                            )}
                            {docInfo.uploadedAt && (
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} /> {new Date(docInfo.uploadedAt).toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2">
                            <a 
                              href={docInfo.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-gray-50 text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-secondary hover:text-white transition-all flex items-center gap-2"
                            >
                              Preview / Open <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Admin remarks */}
                      {docInfo?.remarks && ['rejected', 'reupload_required'].includes(status) && (
                        <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
                          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-0.5">
                              {status === 'reupload_required' ? 'Re-upload Instructions' : 'Rejection Reason'}
                            </p>
                            <p className="text-[10px] text-red-600 font-bold leading-relaxed">{docInfo.remarks}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Upload / Re-upload button */}
                    <div className="shrink-0 w-full md:w-auto">
                      <label className={`w-full md:w-auto py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-black text-xs uppercase tracking-widest cursor-pointer transition-all ${
                        uploading === doc.id ? 'bg-gray-100 text-gray-400 cursor-wait' :
                        status === 'approved' ? 'bg-green-50 border-2 border-green-100 text-green-600 cursor-not-allowed' :
                        isUploaded ? 'bg-white border-2 border-gray-100 text-gray-500 hover:border-primary/30 hover:text-primary' :
                        'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                      }`}>
                        {uploading === doc.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : status === 'approved' ? (
                          <><ShieldCheck size={16} /> Verified</>
                        ) : (
                          <><Upload size={16} /> {isUploaded ? 'Re-upload' : 'Choose PDF'}</>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf" 
                          disabled={uploading === doc.id || status === 'approved'}
                          onChange={(e) => handleUpload(e, doc.id)} 
                        />
                      </label>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
                    <span className="text-2xl font-black">{Math.round((uploadedCount / 4) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary-light transition-all duration-1000"
                      style={{ width: `${(uploadedCount / 4) * 100}%` }}
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
                  Your account will be fully activated for recruitment once all mandatory documents are verified by the Admin.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
              <h2 className="text-xl font-black text-secondary mb-6">Digital Certificates</h2>
              <div className="flex flex-col gap-3">
                <button className="flex items-center justify-between p-5 bg-gray-50 hover:bg-secondary hover:text-white rounded-3xl transition-all group text-left">
                  <div className="flex items-center gap-4">
                    <FileText size={20} className="text-primary group-hover:text-white" />
                    <span className="font-bold text-sm">Authorization Letter</span>
                  </div>
                  <Download size={18} className="opacity-40 group-hover:opacity-100" />
                </button>
                <button className="flex items-center justify-between p-5 bg-gray-50 hover:bg-secondary hover:text-white rounded-3xl transition-all group text-left">
                  <div className="flex items-center gap-4">
                    <ShieldCheck size={20} className="text-primary group-hover:text-white" />
                    <span className="font-bold text-sm">Vendor Code Certificate</span>
                  </div>
                  <Download size={18} className="opacity-40 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
