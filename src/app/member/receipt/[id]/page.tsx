'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Printer, ArrowLeft, ShieldCheck, 
  MapPin, User, Calendar, IndianRupee, 
  FileText, CheckCircle2, Mail, Globe, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemberReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`/api/member/receipt/${id}`);
        if (res.data.success) setReceipt(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReceipt();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse uppercase tracking-widest">Generating Receipt...</div>;
  if (!receipt) return <div className="min-h-screen flex items-center justify-center font-bold text-red-400">Receipt record not found.</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFD] py-10 md:py-16 px-4 print:p-0 print:bg-white">
      {/* Navigation - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 print:hidden flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-primary transition-all border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl text-secondary font-black text-xs uppercase tracking-widest hover:border-primary transition-all shadow-sm"
          >
            <Printer size={18} /> Print Slip
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[210mm] mx-auto bg-white print:shadow-none print:border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 rounded-[40px] overflow-hidden"
      >
        {/* Header Branding */}
        <div className="relative overflow-hidden bg-white px-8 md:px-16 pt-12 md:pt-16 pb-8 border-b-8 border-primary/10">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-secondary tracking-tight">Sakhi<span className="text-primary">Hub</span></h1>
                <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Empowering Rural Women</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-lg md:text-2xl font-black text-secondary tracking-tight">Membership Slip</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 border border-green-100">
                  <CheckCircle2 size={12} /> Payment Confirmed
                </div>
              </div>
           </div>
        </div>

        {/* Receipt Content */}
        <div className="px-8 md:px-16 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-16">
            {/* Left Column: Member Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-primary rounded-full" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Full Name</p>
                  <p className="text-xl md:text-2xl font-black text-secondary">{receipt.memberId?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile No</p>
                    <p className="font-bold text-secondary text-sm">{receipt.memberId?.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Village/Area</p>
                    <p className="font-bold text-secondary text-sm">{receipt.memberId?.village || 'N/A'}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Group</p>
                  <p className="font-bold text-secondary text-sm">{receipt.groupId?.groupName || 'Individual / Pending Allocation'}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Transaction Info */}
            <div className="bg-gray-50/50 p-8 rounded-[35px] border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-secondary rounded-full" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Summary</h3>
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt No</span>
                  <span className="font-bold text-secondary text-sm">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership ID</span>
                  <span className="font-bold text-secondary text-sm">{receipt.membershipId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Date</span>
                  <span className="font-bold text-secondary text-sm">{new Date(receipt.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Mode</span>
                  <span className="px-3 py-1 bg-white rounded-lg border border-gray-200 font-bold text-secondary text-[10px] uppercase">{receipt.paymentMode}</span>
                </div>
                <div className="pt-6 mt-6 border-t border-gray-200 flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Fee Paid</p>
                     <p className="text-4xl font-black text-primary tracking-tight">₹{receipt.amount}</p>
                   </div>
                   <div className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-1 border border-green-100 uppercase tracking-widest">
                      One-Time
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Collector */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-10 border-y border-gray-50 mb-10">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-primary/10 rounded-[20px] flex items-center justify-center text-primary shadow-inner">
                   <User size={28} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fee Collected By</p>
                   <p className="text-lg font-black text-secondary leading-tight">{receipt.employeeId?.fullName || 'System Admin'}</p>
                   <p className="text-[11px] font-bold text-gray-400 mt-1">Authorized Representative</p>
                </div>
             </div>
             <div className="p-5 md:p-6 bg-secondary/5 rounded-[30px] border border-secondary/10 flex items-center gap-5 max-w-[400px]">
                <ShieldCheck size={32} className="text-secondary shrink-0" />
                <p className="text-[10px] font-bold text-secondary/70 leading-relaxed italic">
                  This digital record serves as proof of membership. The transaction has been securely logged on our server. For verification, scan or check via Member Portal.
                </p>
             </div>
          </div>

          {/* Organization Footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 opacity-60">
             <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">www.sakhihub.org</span>
             </div>
             <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">care@sakhihub.org</span>
             </div>
             <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">+91 9988776655</span>
             </div>
             <div className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Madhya Pradesh</span>
             </div>
          </div>
        </div>

        {/* Print Only Disclaimer */}
        <div className="hidden print:block px-16 pb-12">
           <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-[9px] text-gray-400 font-bold leading-relaxed text-center uppercase tracking-[0.2em]">
                System Generated Copy • No Signature Required • Digital Verification ID: {receipt._id}
              </p>
           </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .min-h-screen {
            padding: 0 !important;
            background: white !important;
          }
          div[role="navigation"], .print\\:hidden {
            display: none !important;
          }
          .max-w-3xl, .max-w-4xl {
            max-width: 100% !important;
          }
          .rounded-[40px] {
            border-radius: 0 !important;
          }
          .shadow-2xl {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
