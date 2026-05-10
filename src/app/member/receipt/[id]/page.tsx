'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Download, Printer, ArrowLeft, ShieldCheck, 
  MapPin, User, Calendar, IndianRupee, ClipboardList
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Receipt...</div>;
  if (!receipt) return <div className="min-h-screen flex items-center justify-center">Receipt not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="mb-8 flex items-center gap-2 text-gray-500 font-bold hover:text-primary transition-colors border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-secondary p-8 md:p-12 text-white text-center">
            <h1 className="text-3xl md:text-5xl font-black mb-2">Sakhi<span className="opacity-80">Hub</span></h1>
            <p className="text-[10px] md:text-xs font-bold tracking-[4px] uppercase opacity-80">Official Membership Receipt</p>
            <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
              <ShieldCheck size={16} /> VERIFIED DIGITAL RECORD
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-8 md:p-14">
            <div className="flex flex-col md:flex-row justify-between gap-10 mb-14">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Details</p>
                <h2 className="text-2xl font-black text-secondary">{receipt.memberId?.name}</h2>
                <p className="text-gray-500 font-bold mt-1">{receipt.memberId?.mobile}</p>
                <p className="text-gray-400 text-sm mt-2">{receipt.memberId?.village}, {receipt.memberId?.block}</p>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Receipt Info</p>
                <p className="text-lg font-black text-secondary">No: {receipt.receiptNumber}</p>
                <p className="text-gray-500 font-bold mt-1">ID: {receipt.membershipId}</p>
                <p className="text-gray-400 text-sm mt-2">{new Date(receipt.paymentDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 mb-14">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <span className="font-bold text-gray-500">Membership Fee (One-time)</span>
                <span className="font-black text-xl text-secondary">₹{receipt.amount}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-black text-secondary uppercase tracking-widest text-sm">Total Paid</span>
                <span className="font-black text-3xl text-primary">₹{receipt.amount}.00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-14">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><User size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Collected By</p>
                  <p className="font-bold text-secondary">{receipt.employeeId?.fullName || 'System'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary"><ClipboardList size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Payment Mode</p>
                  <p className="font-bold text-secondary">{receipt.paymentMode}</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                This is a computer generated document and does not require a physical signature. <br />
                Thank you for being a part of the SakhiHub movement.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 justify-center">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-2xl text-secondary font-bold hover:bg-gray-100 transition-all shadow-sm"
            >
              <Printer size={20} /> Print Receipt
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-secondary/20">
              <Download size={20} /> Download PDF
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
