'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Sparkles, Search, Plus, MapPin, Phone, Mail, ExternalLink, ShieldCheck } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function VendorSubVendors() {
  const [subVendors, setSubVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubVendors = async () => {
      try {
        const res = await axios.get('/api/vendor/sub-vendors');
        if (res.data.success) setSubVendors(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubVendors();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">My Sub-Vendors</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your secondary partner network and regional leads</p>
          </div>
          <button className="btn-primary py-4 px-8 shadow-xl shadow-primary/20">
            <Plus size={20} /> Register New Sub-Vendor
          </button>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, code or region..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Vendor</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Size</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Loading partner network...</td></tr>
                ) : subVendors.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No sub-vendors registered under you yet.</td></tr>
                ) : (
                  subVendors.map((sv) => (
                    <tr key={sv._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {sv.fullName[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{sv.fullName}</p>
                            <p className="text-[10px] text-primary font-black mt-1 uppercase tracking-widest">{sv.subVendorCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                          <MapPin size={12} className="text-primary" /> {sv.block || 'All Blocks'}, {sv.district}
                        </div>
                      </td>
                      <td className="p-5 text-sm font-black text-secondary">
                        12 Field Staff
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sv.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {sv.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
