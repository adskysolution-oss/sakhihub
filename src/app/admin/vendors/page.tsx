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
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import HierarchyDetailView from "@/components/features/dashboard/HierarchyDetailView";

export default function VendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  // Body Scroll Lock
  useEffect(() => {
    if (selectedVendor || showRegisterModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedVendor, showRegisterModal]);

  const fetchHierarchyDetails = async (vendor: any) => {
    setSelectedVendor(vendor);
    setLoadingHierarchy(true);
    try {
      const res = await axios.get(`/api/admin/users/${vendor._id}/hierarchy`);
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
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary py-4 px-8"
          >
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
                          {vendor.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(vendor._id, 'active')}
                                className="p-2.5 bg-green-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                title="Approve Vendor"
                              >
                                <ShieldCheck size={16} />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(vendor._id, 'rejected')}
                                className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                                title="Reject Vendor"
                              >
                                <ShieldAlert size={16} />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => fetchHierarchyDetails(vendor)}
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
          {selectedVendor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedVendor(null);
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
                      setSelectedVendor(null);
                      setHierarchyData(null);
                    }}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-red-500 font-bold">Failed to load hierarchy data. Please try again.</p>
                    <button onClick={() => setSelectedVendor(null)} className="btn-primary px-8 py-3 mt-4">Close</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <RegisterPartnerModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => fetchVendors()}
          role="vendor"
        />
      </div>
    </DashboardLayout>
  );
}
