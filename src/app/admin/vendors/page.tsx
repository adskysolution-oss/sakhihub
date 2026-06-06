'use client';

import { getProxiedImageUrl } from "@/utils/imageUrl";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import {
  ShieldCheck, MapPin, Search, Plus,
  ShieldAlert, FileCheck, FileX,
  Phone, Mail, Calendar, ExternalLink, Clock,
  FileText, Upload, AlertCircle, RefreshCw
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import HierarchyDetailView from "@/components/features/dashboard/HierarchyDetailView";
import { getRequiredDocs } from "@/utils/documents";

const statusFilters = ['all', 'pending', 'documents_uploaded', 'under_review', 'reupload_required', 'active', 'rejected', 'paid', 'unpaid'];

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

const getDocComplianceSummary = (documents: any, vendorType?: string) => {
  const requiredDocs = getRequiredDocs('vendor', vendorType);
  let uploaded = 0, approved = 0, rejected = 0;
  requiredDocs.forEach(d => {
    const doc = documents?.[d];
    if (doc?.url) uploaded++;
    if (doc?.status === 'approved') approved++;
    if (doc?.status === 'rejected' || doc?.status === 'reupload_required') rejected++;
  });
  return { total: requiredDocs.length, uploaded, approved, rejected };
};

export default function VendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [counts, setCounts] = useState<any>({
    status: { all: 0, pending: 0, documents_uploaded: 0, under_review: 0, reupload_required: 0, active: 0, rejected: 0 },
    payment: { all: 0, paid: 0, unpaid: 0 }
  });
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 50;
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [hierarchyData, setHierarchyData] = useState<any>(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [agreementFilter, setAgreementFilter] = useState("all");

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/vendors?status=${status}&search=${search}&dateRange=${dateFilter}&paymentStatus=${paymentFilter}&customDate=${customDate}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}&agreement=${agreementFilter}`);
      if (res.data.success) {
        setVendors(res.data.data);
        if (res.data.counts) {
          setCounts(res.data.counts);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, dateFilter, paymentFilter, customDate, startDate, endDate, agreementFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, dateFilter, paymentFilter, customDate, startDate, endDate, page, agreementFilter]);

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

  const handleStatusUpdate = async (id: string, newStatus: string, remarks?: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, {
        status: newStatus,
        remarks
      });
      if (res.data.success) {
        if (newStatus.startsWith('doc:')) {
          // Document update: Refresh hierarchy data for the current detail view
          if (selectedVendor?._id === id) {
            const freshRes = await axios.get(`/api/admin/users/${id}/hierarchy`);
            if (freshRes.data.success) {
              setHierarchyData(freshRes.data.data);
            }
          }
        } else {
          // Global status update: Refresh vendor list
          fetchVendors();
          setSelectedVendor(null);
          setHierarchyData(null);
        }
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
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your primary field partners and legal entities.</p>
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

              <select
                value={agreementFilter}
                onChange={(e) => setAgreementFilter(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="all">Agreement: All</option>
                <option value="generated">Generated</option>
                <option value="not_generated">Not Generated</option>
              </select>

              {dateFilter === 'custom' && (
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="text-gray-400 font-bold text-xs">→</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              )}

            </div>
            <div className="flex gap-1.5 bg-gray-50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
              {statusFilters.map((s) => {
                const labelMap: Record<string, string> = {
                  all: 'All',
                  pending: 'Pending',
                  documents_uploaded: 'Docs Submitted',
                  under_review: 'Review',
                  reupload_required: 'Re-upload',
                  active: 'Active',
                  rejected: 'Rejected',
                  paid: 'Paid',
                  unpaid: 'Unpaid'
                };
                const countColorMap: Record<string, string> = {
                  all: 'text-primary',
                  pending: 'text-amber-500',
                  documents_uploaded: 'text-blue-500',
                  under_review: 'text-purple-500',
                  reupload_required: 'text-orange-500',
                  active: 'text-green-600',
                  rejected: 'text-red-500',
                  paid: 'text-emerald-500',
                  unpaid: 'text-red-400'
                };
                let count = 0;
                if (s === 'paid') {
                  count = counts.payment.paid;
                } else if (s === 'unpaid') {
                  count = counts.payment.unpaid;
                } else {
                  count = counts.status[s as keyof typeof counts.status] || 0;
                }
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${status === s ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {labelMap[s] || s} <span className={`ml-1 font-bold ${countColorMap[s] || 'text-gray-400'}`}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-[60px]">S.No.</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code & Region</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Compliance</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-bold italic">Syncing with vendor registry...</td></tr>
                ) : vendors.length === 0 ? (
                  <tr><td colSpan={7} className="p-20 text-center text-gray-400 font-bold italic">No vendors found matching your search.</td></tr>
                ) : (
                  vendors.map((vendor, index) => {
                    const compliance = getDocComplianceSummary(vendor.documents, vendor.vendorType);
                    const badge = getStatusBadge(vendor.status);

                    return (
                      <tr key={vendor._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => fetchHierarchyDetails(vendor)}>
                        <td className="p-5 text-xs font-bold text-gray-400">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="p-5">
                          <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden">
                              {vendor.profileImage ? (
                                <img src={getProxiedImageUrl(vendor.profileImage)} alt={vendor.fullName} className="w-full h-full object-cover" />
                              ) : (
                                vendor.fullName[0]
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-black text-secondary leading-tight">{vendor.fullName}</p>
                                {(() => {
                                  const details = vendor.vendorAgreementDetails;
                                  if (!details) {
                                    return (
                                      <span 
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 text-[8px] font-black uppercase tracking-wider" 
                                        title="Agreement: Not Generated"
                                      >
                                        <FileText size={10} /> No Agr
                                      </span>
                                    );
                                  }
                                  const status = details.status || 'generated';
                                  const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
                                    generated: { label: 'Agr Generated', cls: 'bg-blue-50 text-blue-600 border border-blue-100', icon: FileText },
                                    uploaded: { label: 'Agr Uploaded', cls: 'bg-purple-50 text-purple-600 border border-purple-100', icon: Upload },
                                    under_review: { label: 'Agr Review', cls: 'bg-amber-50 text-amber-600 border border-amber-100', icon: Clock },
                                    approved: { label: 'Agr Approved', cls: 'bg-green-50 text-green-600 border border-green-100', icon: FileCheck },
                                    rejected: { label: 'Agr Rejected', cls: 'bg-red-50 text-red-600 border border-red-100', icon: AlertCircle },
                                    reupload_required: { label: 'Agr Re-upload', cls: 'bg-orange-50 text-orange-600 border border-orange-100', icon: RefreshCw },
                                  };
                                  const config = statusConfig[status] || statusConfig.generated;
                                  const Icon = config.icon;
                                  return (
                                    <span 
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${config.cls}`}
                                      title={`Agreement Status: ${config.label}`}
                                    >
                                      <Icon size={10} /> {config.label}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Joined {new Date(vendor.createdAt).toLocaleDateString()}</p>
                                {vendor.vendorType && (
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${vendor.vendorType === 'company' ? 'bg-blue-100 text-blue-600' :
                                      vendor.vendorType === 'ngo_trust' ? 'bg-purple-100 text-purple-600' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                    {vendor.vendorType === 'ngo_trust' ? 'NGO/Trust' : vendor.vendorType === 'company' ? 'Company' : 'Individual'}
                                  </span>
                                )}
                              </div>
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
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {Array.from({ length: compliance.total }).map((_, i) => (
                                  <div key={i} className={`w-6 h-1.5 rounded-full ${i < compliance.approved ? 'bg-green-500' :
                                      i < compliance.uploaded ? 'bg-primary' :
                                        'bg-gray-200'
                                    }`} />
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                              {compliance.uploaded > 0 && (
                                <span className="text-primary flex items-center gap-1"><Upload size={10} /> {compliance.uploaded}/{compliance.total}</span>
                              )}
                              {compliance.approved > 0 && (
                                <span className="text-green-600 flex items-center gap-1"><FileCheck size={10} /> {compliance.approved}</span>
                              )}
                              {compliance.rejected > 0 && (
                                <span className="text-red-500 flex items-center gap-1"><FileX size={10} /> {compliance.rejected}</span>
                              )}
                              {compliance.uploaded === 0 && (
                                <span className="text-gray-400 flex items-center gap-1"><Clock size={10} /> No docs</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5" onClick={(e) => e.stopPropagation()}>
                          {vendor.paymentCompleted ? (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                              Paid
                            </span>
                          ) : (vendor.subscriptionPaid || vendor.depositPaid) ? (
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${vendor.subscriptionPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                Sub: {vendor.subscriptionPaid ? 'Paid' : 'Pending'}
                              </span>
                              <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${vendor.depositPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                Dep: {vendor.depositPaid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          ) : (
                            <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-600">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchHierarchyDetails(vendor);
                              }}
                              className="p-2.5 bg-secondary text-white rounded-xl shadow-lg hover:scale-110 "
                              title="View Details & Review Documents"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {(() => {
            const totalCount = status === 'paid' ? counts.payment.paid : status === 'unpaid' ? counts.payment.unpaid : (counts.status[status] || 0);
            const startEntry = totalCount === 0 ? 0 : (page - 1) * limit + 1;
            const endEntry = Math.min(page * limit, totalCount);
            const totalPages = Math.ceil(totalCount / limit);

            if (totalCount === 0) return null;

            return (
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 flex-wrap gap-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Showing {startEntry} to {endEntry} of {totalCount} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-secondary disabled:opacity-50 hover:bg-gray-50 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages || totalPages === 0}
                    className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-black uppercase tracking-wider text-secondary disabled:opacity-50 hover:bg-gray-50 transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            );
          })()}
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
