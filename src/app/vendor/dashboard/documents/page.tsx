'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  FileText, Upload, CheckCircle, Clock, 
  AlertCircle, Download, ExternalLink, ShieldCheck 
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function VendorDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const docTypes = [
    { type: 'ngo_reg', label: 'NGO Registration' },
    { type: 'pan', label: 'PAN Card' },
    { type: 'aadhaar', label: 'Aadhaar Card' },
    { type: 'bank_passbook', label: 'Bank Passbook / Cheque' },
    { type: 'agreement', label: 'Signed Agreement' },
  ];

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('/api/user/documents');
      if (res.data.success) setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: any, type: string) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('title', docTypes.find(d => d.type === type)?.label || 'Document');

    try {
      const res = await axios.post('/api/user/documents', formData);
      if (res.data.success) {
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-black text-secondary">Document Center</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Verify your identity and legal compliance</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
            <h2 className="text-xl font-black text-secondary mb-8">Upload Documents</h2>
            <div className="flex flex-col gap-4">
              {docTypes.map((dt) => {
                const existing = documents.find(d => d.type === dt.type);
                return (
                  <div key={dt.type} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center group hover:bg-gray-100 transition-all">
                    <div>
                      <h4 className="font-bold text-secondary">{dt.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">
                        {existing ? `Status: ${existing.status}` : 'Action Required'}
                      </p>
                    </div>
                    {existing ? (
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${existing.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {existing.status}
                        </span>
                        <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl text-primary hover:bg-primary hover:text-white shadow-sm transition-all">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                        Upload
                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, dt.type)} disabled={uploading} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guidelines & Verification Status */}
          <div className="flex flex-col gap-8">
            <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl">
              <div className="items-center gap-4 mb-6 hidden md:flex">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary">
                  <ShieldCheck size={28} />
                </div>
                <h2 className="text-xl font-black">Verification Level</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold opacity-60 uppercase tracking-widest">Compliance Progress</span>
                  <span className="text-2xl font-black">{Math.round((documents.length / docTypes.length) * 100)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary-light transition-all duration-1000"
                    style={{ width: `${(documents.length / docTypes.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-white/60 mt-8 font-medium leading-relaxed">
                Your account will be fully activated for recruitment once all mandatory documents are verified by the Admin.
              </p>
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
