'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Sparkles, MapPin, Search, Plus, 
  Edit2, Trash2, ShieldAlert, ShieldCheck,
  Phone, Mail, Calendar, Filter, X, Briefcase, ExternalLink, Link2
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function SubVendorManagement() {
  const [subVendors, setSubVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedSV, setSelectedSV] = useState<any>(null);

  const fetchSubVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/sub-vendors?status=${status}&search=${search}`);
      if (res.data.success) setSubVendors(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubVendors();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { status: newStatus });
      if (res.data.success) {
        fetchSubVendors();
        setSelectedSV(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Sub-Vendor Network</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage secondary partners and regional recruitment leads.</p>
          </div>
          <button className="btn-primary py-4 px-8">
            <Plus size={20} /> Add Sub-Vendor
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <div className="flex gap-4 mb-8 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by sub-vendor name, code, or parent vendor..." 
                className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl">
               {['all', 'pending', 'active', 'rejected'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${status === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Vendor</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parent Vendor</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Loading partner network...</td></tr>
                ) : subVendors.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No sub-vendors found.</td></tr>
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-black text-xs">
                            {sv.parentVendorId?.fullName?.[0] || 'V'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-secondary">{sv.parentVendorId?.fullName || 'Direct Admin'}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{sv.parentVendorId?.vendorCode || 'System'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                          <MapPin size={12} className="text-primary" /> {sv.block || 'All Blocks'}, {sv.district}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sv.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {sv.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setSelectedSV(sv)}
                            className="p-2.5 bg-secondary text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {selectedSV && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedSV(null)}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-primary to-secondary p-12 text-white relative">
                  <button 
                    onClick={() => setSelectedSV(null)}
                    className="absolute right-8 top-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                  ><X size={20} /></button>
                  <div className="flex gap-8 items-center">
                    <div className="w-24 h-24 rounded-[32px] bg-white text-primary flex items-center justify-center text-4xl font-black shadow-2xl shadow-black/20">
                      {selectedSV.fullName[0]}
                    </div>
                    <div>
                      <h3 className="text-4xl font-black tracking-tight">{selectedSV.fullName}</h3>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                          Sub-Vendor: {selectedSV.subVendorCode}
                        </span>
                        <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 flex items-center gap-1">
                          <Link2 size={10} /> {selectedSV.parentVendorId?.fullName || 'Independent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Identity Information</h4>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <Phone size={18} className="text-primary" />
                          <span className="font-black text-secondary">{selectedSV.mobile}</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <Mail size={18} className="text-primary" />
                          <span className="font-black text-secondary">{selectedSV.email || 'No email provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Operations Detail</h4>
                      <div className="flex flex-col gap-4">
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/5">
                          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Assigned Area</p>
                          <p className="font-black text-secondary text-lg">{selectedSV.block}, {selectedSV.district}</p>
                        </div>
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/5">
                          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Affiliation</p>
                          <p className="font-black text-secondary text-lg">{selectedSV.parentVendorId?.fullName || 'Direct'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 flex gap-4 justify-end">
                   {selectedSV.status === 'pending' ? (
                     <>
                        <button 
                          onClick={() => handleStatusUpdate(selectedSV._id, 'rejected')}
                          className="px-8 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-50 transition-all"
                        >Reject</button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedSV._id, 'active')}
                          className="btn-primary px-12 py-4 shadow-xl shadow-primary/20"
                        >Activate Partner</button>
                     </>
                   ) : (
                     <button 
                       onClick={() => handleStatusUpdate(selectedSV._id, selectedSV.status === 'active' ? 'inactive' : 'active')}
                       className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedSV.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                     >
                       {selectedSV.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                     </button>
                   )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
