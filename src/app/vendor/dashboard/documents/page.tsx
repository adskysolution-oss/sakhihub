'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  FileText, ShieldCheck, Download, AlertCircle
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';

export default function VendorDocuments() {
  const [documents, setDocuments] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const { uploading, uploadDocument } = useDocumentFlow({
    onSuccess: async () => { await fetchDocuments(); }
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

  const compliance = getDocComplianceSummary(documents, 'vendor');
  const docTypes = REQUIRED_DOCS_BY_ROLE.vendor;

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
                  Your account will be fully activated for recruitment once all mandatory documents are verified by the Admin.
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
