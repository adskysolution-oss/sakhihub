'use client';

import { getProxiedImageUrl } from "@/utils/imageUrl";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Sparkles, MapPin, Search, Plus, 
  Edit2, Trash2, ShieldAlert, ShieldCheck,
  Phone, Mail, Calendar, Filter, X, Briefcase, ExternalLink, Link2, Upload
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import HierarchyDetailView from "@/components/features/dashboard/HierarchyDetailView";
import { getDocComplianceSummary } from '@/utils/documents';

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-500' },
    documents_uploaded: { label: 'Docs Submitted', className: 'bg-blue-100 text-blue-600' },
    under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-600' },
    reupload_required: { label: 'Re-upload', className: 'bg-red-100 text-red-600' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-600' },
    active: { label: 'Active', className: 'bg-green-100 text-green-600' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600' },
    suspended: { label: 'Suspended', className: 'bg-gray-200 text-gray-600' },
  };
  return map[status] || { label: status, className: 'bg-gray-100 text-gray-500' };
};



export default function SubVendorManagement() {
  const [subVendors, setSubVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
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
      const res = await axios.get(`/api/admin/sub-vendors?status=${status}&search=${search}&dateRange=${dateFilter}&paymentStatus=${paymentFilter}&customDate=${customDate}`);
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
  }, [search, status, dateFilter, paymentFilter, customDate]);

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

  const handleStatusUpdate = async (id: string, newStatus: string, remarks?: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { 
        status: newStatus,
        remarks 
      });
      if (res.data.success) {
        if (newStatus.startsWith('doc:')) {
          // Document update: Refresh hierarchy data for the current detail view
          if (selectedSV?._id === id) {
            const freshRes = await axios.get(`/api/admin/users/${id}/hierarchy`);
            if (freshRes.data.success) {
              setHierarchyData(freshRes.data.data);
            }
          }
        } else {
          // Global status update: Refresh vendor list
          fetchSubVendors();
          setSelectedSV(null);
          setHierarchyData(null);
        }
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
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage secondary partners and regional field coordinators.</p>
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
            <div className="flex gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="custom">Custom Date</option>
              </select>
              
              {dateFilter === 'custom' && (
                <input 
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              )}
              
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
             <div className="flex gap-2 bg-gray-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
               {['all', 'pending', 'documents_uploaded', 'under_review', 'reupload_required', 'active', 'rejected'].map((s) => (
                 <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${status === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {s === 'documents_uploaded' ? 'Docs Submitted' : s === 'reupload_required' ? 'Re-upload' : s === 'under_review' ? 'Review' : s}
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
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Compliance</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</th>
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
                     <tr key={sv._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => fetchHierarchyDetails(sv)}>
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-black text-xl shadow-lg">
                            {sv.fullName[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{sv.fullName}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                               <p className="text-[10px] text-primary font-black uppercase tracking-widest">{sv.subVendorCode}</p>
                               {sv.vendorType && (
                                 <>
                                   <span className="text-[9px] text-gray-300 font-bold">•</span>
                                   <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                                     {sv.vendorType.replace('_', ' ')}
                                   </span>
                                 </>
                               )}
                               <span className="text-[9px] text-gray-300 font-bold">•</span>
                               <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1"><MapPin size={10} /> {sv.district}</span>
                            </div>
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
                        {(() => {
                          const compliance = getDocComplianceSummary(sv.documents, 'sub_vendor', sv.vendorType);
                          return (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                {Array.from({ length: compliance.total }).map((_, i) => (
                                  <div key={i} className={`h-1.5 flex-1 rounded-full max-w-[32px] ${
                                    i < compliance.approved ? 'bg-green-500' :
                                    i < compliance.uploaded ? 'bg-primary' :
                                    'bg-gray-200'
                                  }`} />
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                {compliance.uploaded > 0 && (
                                  <span className="text-primary flex items-center gap-1"><Upload size={10} /> {compliance.uploaded}/{compliance.total}</span>
                                )}
                                {compliance.approved > 0 && (
                                  <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={10} /> {compliance.approved}</span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-5" onClick={(e) => e.stopPropagation()}>
                        {sv.paymentCompleted ? (
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                            Paid
                          </span>
                        ) : (sv.subscriptionPaid || sv.depositPaid) ? (
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${sv.subscriptionPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                              Sub: {sv.subscriptionPaid ? 'Paid' : 'Pending'}
                            </span>
                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${sv.depositPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                              Dep: {sv.depositPaid ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-5">
                        {(() => {
                          const badge = getStatusBadge(sv.status);
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
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
