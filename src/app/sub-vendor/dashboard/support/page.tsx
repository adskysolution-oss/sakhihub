'use client';

import React from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Heart, MessageCircle, Plus } from "lucide-react";

export default function SubVendorSupport() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl font-black text-secondary">Support</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Help and assistance for your regional operations</p>
          </div>
          <button className="btn-primary py-4 px-8 shadow-xl shadow-primary/20">
            <Plus size={20} /> New Ticket
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-soft text-center h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                <MessageCircle size={40} className="text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-secondary mb-2">No Open Tickets</h3>
              <p className="text-gray-400 font-bold italic">You don't have any active support requests.</p>
            </div>
          </div>

          <div className="bg-secondary p-8 rounded-[40px] text-white shadow-2xl">
             <Heart className="text-primary mb-6" size={40} fill="currentColor" />
             <h3 className="text-xl font-black mb-4">Partner Support</h3>
             <p className="text-white/60 font-medium mb-8 leading-relaxed">Need help with field operations or payouts? Contact your parent vendor or SakhiHub support.</p>
             <div className="space-y-4">
               <div className="p-4 bg-white/10 rounded-2xl">
                 <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Support Email</p>
                 <p className="font-bold">support@sakhihub.org</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
