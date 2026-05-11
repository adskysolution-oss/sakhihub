'use client';

import React, { useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Heart, MessageCircle, Send, Plus, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function VendorSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Partner Support</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Raise tickets and get assistance from the SakhiHub team</p>
          </div>
          <button className="btn-primary py-4 px-8 shadow-xl shadow-primary/20">
            <Plus size={20} /> New Support Ticket
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft min-h-[500px]">
              <h2 className="text-xl font-black text-secondary mb-8">Active Tickets</h2>
              
              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
                    <MessageCircle size={40} className="text-primary/30" />
                  </div>
                  <p className="text-gray-400 font-bold italic">No active support requests. Everything looks good!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Ticket items would go here */}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
             <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl">
                <Heart className="text-primary mb-6" size={40} fill="currentColor" />
                <h3 className="text-xl font-black mb-4">Dedicated Helpline</h3>
                <p className="text-white/60 font-medium mb-8 leading-relaxed">Our partner success team is available Mon-Fri, 10 AM to 6 PM for priority assistance.</p>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Email Support</p>
                    <p className="font-bold">partners@sakhihub.org</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">WhatsApp Hub</p>
                    <p className="font-bold">+91 98765 43210</p>
                  </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
                <h4 className="text-sm font-black text-secondary mb-6 uppercase tracking-widest">Support FAQ</h4>
                <div className="space-y-6">
                   {[
                     "How to update KYC?",
                     "Commission payout cycle",
                     "Adding new sub-vendors"
                   ].map((q, i) => (
                     <div key={i} className="flex gap-4 items-start group cursor-pointer">
                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-primary transition-all">
                           <div className="w-1 h-1 bg-gray-300 rounded-full group-hover:bg-white"></div>
                        </div>
                        <p className="text-xs font-bold text-gray-500 group-hover:text-secondary transition-all">{q}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
