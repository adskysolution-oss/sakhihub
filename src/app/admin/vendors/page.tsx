'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  ShieldCheck, MapPin, Search, Plus, 
  Edit2, Trash2, ShieldAlert,
  Phone, Mail, Calendar, Filter, X, Briefcase, ExternalLink
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/vendors?status=${status}&search=${search}`);
      if (res.data.success) setVendors(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { status: newStatus });
      if (res.data.success) {
        fetchVendors();
        setSelectedVendor(null);
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
            <h1 className="text-3xl md:text-4xl font-black text-secondary">Vendor Network</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your primary recruitment partners and legal entities.</p>
          </div>
          <button className="btn-primary py-4 px-8">
            <Plus size={20} /> Register New Vendor
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
                placeholder="Search by vendor name, code, or mobile..." 
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
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code & Region</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">Syncing with vendor registry...</td></tr>
                ) : vendors.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold italic">No vendors found matching your search.</td></tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {vendor.fullName[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{vendor.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Joined {new Date(vendor.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-black text-primary text-sm tracking-widest uppercase">{vendor.vendorCode}</span>
                          <span className="text-xs text-gray-400 font-bold flex items-center gap-1 mt-1">
                            <MapPin size={10} /> {vendor.district || 'Multiple Regions'}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center" title="KYC Verified"><ShieldCheck size={16} /></div>
                           <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center" title="Agreement Signed"><Briefcase size={16} /></div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${vendor.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setSelectedVendor(vendor)}
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
          {selectedVendor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedVendor(null)}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="bg-gradient-to-r from-secondary-dark to-secondary p-12 text-white relative">
                  <button 
                    onClick={() => setSelectedVendor(null)}
                    className="absolute right-8 top-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                  ><X size={20} /></button>
                  <div className="flex gap-8 items-center">
                    <div className="w-24 h-24 rounded-[32px] bg-white text-secondary flex items-center justify-center text-4xl font-black shadow-2xl shadow-black/20">
                      {selectedVendor.fullName[0]}
                    </div>
                    <div>
                      <h3 className="text-4xl font-black tracking-tight">{selectedVendor.fullName}</h3>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                          Vendor: {selectedVendor.vendorCode}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedVendor.status === 'active' ? 'bg-green-400 text-secondary' : 'bg-amber-400 text-secondary'}`}>
                          {selectedVendor.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex flex-col gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Contact Information</h4>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <Phone size={18} className="text-primary" />
                          <span className="font-black text-secondary">{selectedVendor.mobile}</span>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                          <Mail size={18} className="text-primary" />
                          <span className="font-black text-secondary">{selectedVendor.email || 'No email provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Business Details</h4>
                      <div className="flex flex-col gap-4">
                        <div className="p-5 bg-secondary-light/5 rounded-2xl border border-secondary/5">
                          <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-1">Base Region</p>
                          <p className="font-black text-secondary text-lg">{selectedVendor.district || 'Multiple Regions'}</p>
                        </div>
                        <div className="p-5 bg-secondary-light/5 rounded-2xl border border-secondary/5">
                          <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest mb-1">Total Employees</p>
                          <p className="font-black text-secondary text-lg">24 Field Staff</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gray-50 flex gap-4 justify-end">
                   {selectedVendor.status === 'pending' ? (
                     <>
                        <button 
                          onClick={() => handleStatusUpdate(selectedVendor._id, 'rejected')}
                          className="px-8 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-black text-sm uppercase tracking-widest hover:bg-red-50 transition-all"
                        >Reject</button>
                        <button 
                          onClick={() => handleStatusUpdate(selectedVendor._id, 'active')}
                          className="btn-primary px-12 py-4 shadow-xl shadow-primary/20"
                        >Approve Vendor</button>
                     </>
                   ) : (
                     <button 
                       onClick={() => handleStatusUpdate(selectedVendor._id, selectedVendor.status === 'active' ? 'inactive' : 'active')}
                       className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${selectedVendor.status === 'active' ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                     >
                       {selectedVendor.status === 'active' ? 'Deactivate Account' : 'Re-activate Account'}
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
