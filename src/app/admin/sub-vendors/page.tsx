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
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import HierarchyDetailView from "@/components/features/dashboard/HierarchyDetailView";

export default function SubVendorManagement() {
  const [subVendors, setSubVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedSV, setSelectedSV] = useState<any>(null);
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [availableVendors, setAvailableVendors] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchVendors = async () => {
    try {
      const res = await axios.get('/api/admin/vendors?status=active');
      if (res.data.success) setAvailableVendors(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

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

  // Body Scroll Lock
  useEffect(() => {
    if (selectedSV || showRegisterModal || assignTarget) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedSV, showRegisterModal, assignTarget]);

  const fetchHierarchyDetails = async (sv: any) => {
    setSelectedSV(sv);
    setLoadingHierarchy(true);
    try {
      const res = await axios.get(`/api/admin/users/${sv._id}/hierarchy`);
      if (res.data.success) {
        setHierarchyData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch hierarchy details", err);
    } finally {
      setLoadingHierarchy(false);
    }
  };

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

  const handleAssignVendor = async (vendorId: string) => {
    if (!assignTarget || !vendorId) return;
    setIsAssigning(true);
    try {
      const res = await axios.patch(`/api/admin/users/${assignTarget._id}/assign`, { 
        parentVendorId: vendorId 
      });
      if (res.data.success) {
        fetchSubVendors();
        setAssignTarget(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
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
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary py-4 px-8"
          >
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
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${sv.assignmentStatus === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-500'}`}>
                            {sv.parentVendorId?.fullName?.[0] || (sv.assignmentStatus === 'pending' ? '?' : 'V')}
                          </div>
                          <div>
                            <p className={`text-xs font-black ${sv.assignmentStatus === 'pending' ? 'text-amber-500' : 'text-secondary'}`}>
                              {sv.parentVendorId?.fullName || (sv.assignmentStatus === 'pending' ? 'Awaiting Assignment' : 'Direct Admin')}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                              {sv.parentVendorId?.vendorCode || (sv.assignmentStatus === 'pending' ? 'Hierarchy Pending' : 'System')}
                            </p>
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
                          {sv.assignmentStatus === 'pending' ? (
                            <button 
                              onClick={() => setAssignTarget(sv)}
                              className="p-2.5 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                              title="Assign Vendor"
                            >
                              <Link2 size={16} />
                            </button>
                          ) : sv.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(sv._id, 'active')}
                                className="p-2.5 bg-green-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                title="Approve Sub-Vendor"
                              >
                                <ShieldCheck size={16} />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(sv._id, 'rejected')}
                                className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                title="Reject Sub-Vendor"
                              >
                                <ShieldAlert size={16} />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => fetchHierarchyDetails(sv)}
                              className="p-2.5 bg-secondary text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                            >
                              <ExternalLink size={16} />
                            </button>
                          )}
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedSV(null);
                  setHierarchyData(null);
                }}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-6xl md:max-h-[90vh] rounded-t-[40px] md:rounded-[40px] overflow-y-auto custom-scrollbar shadow-2xl z-10"
              >
                {loadingHierarchy ? (
                  <div className="h-[600px] flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold animate-pulse">Assembling Network Hierarchy...</p>
                  </div>
                ) : hierarchyData ? (
                  <HierarchyDetailView 
                    data={hierarchyData} 
                    onClose={() => {
                      setSelectedSV(null);
                      setHierarchyData(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-red-500 font-bold">Failed to load hierarchy data. Please try again.</p>
                    <button onClick={() => setSelectedSV(null)} className="btn-primary px-8 py-3 mt-4">Close</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {assignTarget && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setAssignTarget(null)}
                className="absolute inset-0 bg-secondary/60 backdrop-blur-md" 
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                    <Link2 size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-secondary">Assign Vendor</h3>
                  <p className="text-gray-400 font-bold text-sm mt-1">Select a parent vendor for {assignTarget.fullName}</p>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Available Vendors</label>
                  <select 
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    onChange={(e) => handleAssignVendor(e.target.value)}
                    disabled={isAssigning}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a vendor...</option>
                    {availableVendors.map(v => (
                      <option key={v._id} value={v._id}>{v.fullName} ({v.vendorCode})</option>
                    ))}
                  </select>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex gap-3">
                  <button 
                    onClick={() => setAssignTarget(null)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
                  >Cancel</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <RegisterPartnerModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => fetchSubVendors()}
          role="sub_vendor"
        />
      </div>
    </DashboardLayout>
  );
}
