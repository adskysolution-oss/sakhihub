'use client';

import React from 'react';
import { 
  ShieldCheck, MapPin, Calendar, User, 
  CreditCard, Printer, Download, Share2, 
  ArrowLeft, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DigitalReceipt({ receipt }: { receipt: any }) {
  if (!receipt) return null;

  return (
    <div className="max-w-[700px] mx-auto w-full px-4 py-10">
      <div className="mb-8 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 bg-transparent border-none text-gray-500 font-bold hover:text-primary transition-colors">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
            <Printer size={20} />
          </button>
          <button className="p-3 bg-primary text-white border-none rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Download size={20} />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 relative print:shadow-none print:border-none"
      >
        {/* Header Decor */}
        <div className="h-4 bg-gradient-to-r from-primary via-secondary to-primary" />
        
        <div className="p-8 sm:p-12">
          {/* Logo & Status */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-8 mb-12">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-black text-secondary">
                Sakhi<span className="text-primary">Hub</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Official Payment Receipt</p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-green-50 rounded-2xl border border-green-100">
              <ShieldCheck size={24} className="text-green-500" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">Status</p>
                <p className="text-sm font-black text-green-700 leading-tight">Verified & Paid</p>
              </div>
            </div>
          </div>

          {/* Receipt Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 py-10 border-y border-gray-50 relative">
            <div className="flex flex-col gap-8">
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0"><User size={22} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Member Name</p>
                    <p className="text-lg font-black text-secondary">{receipt.memberId?.fullName || 'Active Member'}</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0"><CreditCard size={22} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Membership ID</p>
                    <p className="text-lg font-black text-secondary">{receipt.membershipId}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-8">
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0"><Calendar size={22} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Date</p>
                    <p className="text-lg font-black text-secondary">{new Date(receipt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0"><MapPin size={22} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-lg font-black text-secondary">{receipt.memberId?.village || 'Community Center'}</p>
                  </div>
               </div>
            </div>
            <Heart className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 text-primary opacity-[0.03] pointer-events-none" />
          </div>

          {/* Amount Section */}
          <div className="bg-secondary rounded-[35px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-secondary/20">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] mb-2">Total Amount Paid</p>
                  <h2 className="text-5xl md:text-6xl font-black">₹{receipt.amount}.00</h2>
                </div>
                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                   <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Payment Mode</p>
                   <p className="text-lg font-black uppercase">{receipt.paymentMode}</p>
                </div>
             </div>
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-xs font-semibold leading-relaxed">
              This is a digitally generated receipt and does not require a physical signature. <br />
              SakhiHub © {new Date().getFullYear()} • Empowering Women through Community Finance
            </p>
            <div className="mt-8 pt-8 border-t border-gray-50 flex justify-center gap-6 grayscale opacity-50">
               {/* Small logos or icons here */}
               <div className="text-[10px] font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-lg">HUB-ID: {receipt._id.slice(-6).toUpperCase()}</div>
               <div className="text-[10px] font-bold text-gray-400 border border-gray-200 px-3 py-1 rounded-lg">VERIFIED BY ADMIN</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 text-center flex flex-wrap justify-center gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all">
          <Share2 size={18} /> Share Receipt
        </button>
      </div>
    </div>
  );
}
