'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { FileText, Upload, ExternalLink, ShieldCheck, Download } from "lucide-react";
import axios from "axios";

export default function SubVendorDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const docTypes = [
    { type: 'pan', label: 'PAN Card' },
    { type: 'aadhaar', label: 'Aadhaar Card' },
    { type: 'bank_passbook', label: 'Bank Passbook' },
    { type: 'agreement', label: 'Sub-Vendor Agreement' },
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get('/api/user/documents');
        if (res.data.success) setDocuments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-black text-secondary">Compliance Documents</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your KYC and partnership agreements</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
            <h2 className="text-xl font-black text-secondary mb-8">Uploaded Files</h2>
            <div className="flex flex-col gap-4">
              {docTypes.map((dt) => {
                const existing = documents.find(d => d.type === dt.type);
                return (
                  <div key={dt.type} className="p-6 bg-gray-50 rounded-3xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-secondary">{dt.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">
                        {existing ? `Status: ${existing.status}` : 'Pending Upload'}
                      </p>
                    </div>
                    {existing ? (
                      <div className="flex items-center gap-3">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${existing.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {existing.status}
                        </span>
                        <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-xl text-primary shadow-sm hover:bg-primary hover:text-white transition-all">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    ) : (
                      <button className="bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest">Upload</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-center">
             <ShieldCheck size={48} className="text-primary mb-6" />
             <h3 className="text-2xl font-black mb-4">Verification Status</h3>
             <p className="text-white/60 mb-8 leading-relaxed">Your account remains in 'Pending' status until all mandatory documents are approved by the SakhiHub compliance team.</p>
             <div className="p-6 bg-white/10 rounded-3xl border border-white/10">
                <p className="text-sm font-bold">Current Status: <span className="text-primary uppercase tracking-widest ml-2">Under Review</span></p>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
