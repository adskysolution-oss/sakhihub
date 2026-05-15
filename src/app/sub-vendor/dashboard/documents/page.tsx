'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  ShieldCheck
} from "lucide-react";
import axios from "axios";
import { REQUIRED_DOCS_BY_ROLE, getDocComplianceSummary } from '@/utils/documents';
import DocumentCard from '@/components/features/dashboard/DocumentCard';
import { useDocumentFlow } from '@/hooks/useDocumentFlow';

export default function SubVendorDocuments() {
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

  const compliance = getDocComplianceSummary(documents, 'sub_vendor');
  const docTypes = REQUIRED_DOCS_BY_ROLE.sub_vendor;

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
          <h1 className="text-3xl font-black text-secondary">Compliance Documents</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your KYC and partnership agreements</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
            <h2 className="text-xl font-black text-secondary mb-8">Document Upload</h2>
            <div className="flex flex-col gap-5">
              {docTypes.map((type) => (
                <DocumentCard 
                  key={type}
                  type={type}
                  docInfo={documents?.[type]}
                  uploading={uploading === type}
                  onUpload={(file) => uploadDocument(file, type)}
                />
              ))}
            </div>
          </div>

          <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-[-30px] right-[-30px] w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <ShieldCheck size={48} className="text-primary mb-6" />
              <h3 className="text-2xl font-black mb-4">Verification Status</h3>
              <p className="text-white/60 mb-8 leading-relaxed">Your account remains in 'Pending' status until all mandatory documents are approved by the SakhiHub compliance team.</p>
              <div className="space-y-3">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold">Documents Uploaded</span>
                  <span className="text-xl font-black text-primary">{compliance.uploaded}/{compliance.total}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary-light transition-all duration-1000"
                    style={{ width: `${(compliance.uploaded / compliance.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
