'use client';

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Sparkles, Search, Plus, MapPin, Phone, Mail, ExternalLink, ShieldCheck, Map } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import RegisterPartnerModal from "@/components/features/dashboard/RegisterPartnerModal";
import ChildProfileView from "@/components/features/dashboard/ChildProfileView";
import UnifiedFilterBar from "@/components/shared/filters/UnifiedFilterBar";
import StatusFilterTabs from "@/components/shared/filters/StatusFilterTabs";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { useLanguage } from "@/context/LanguageContext";

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

export default function VendorSubVendors() {
  const { t } = useLanguage();
  const [subVendors, setSubVendors] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [counts, setCounts] = useState({ status: {}, payment: {} });
  const isFirstMount = useRef(true);

  const fetchSubVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
        dateRange: dateFilter,
      });
      if (search) params.append('search', search);
      if (dateFilter === 'custom' && startDate) params.append('startDate', startDate);
      if (dateFilter === 'custom' && endDate) params.append('endDate', endDate);

      const res = await axios.get(`/api/vendor/sub-vendors?${params.toString()}`);
      if (res.data.success) {
        setSubVendors(res.data.data);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) setVendorProfile(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSubVendors();
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchSubVendors();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, page, status, dateFilter, startDate, endDate]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">My Sub-Vendors</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Manage your secondary partner network and regional leads</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/vendor/dashboard/network"
              className="flex items-center gap-2 px-6 py-4 bg-secondary/5 text-secondary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all border border-secondary/10"
            >
              <Map size={16} /> View Network Tree
            </Link>
            <button 
              onClick={() => setShowRegisterModal(true)}
              className="btn-primary py-4 px-8 shadow-xl shadow-primary/20"
            >
              <Plus size={20} /> Register New Sub-Vendor
            </button>
          </div>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <UnifiedFilterBar
            search={search} setSearch={setSearch} searchPlaceholder="Search by name, code or region..."
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
          />
          <StatusFilterTabs status={status} setStatus={setStatus} counts={counts as any} />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sub-Vendor</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Region</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Size</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">Loading partner network...</td></tr>
                ) : subVendors.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">No sub-vendors registered under you yet.</td></tr>
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
                        {(() => {
                          const badge = getStatusBadge(sv.status);
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              {t('status.' + sv.status, badge.label)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-5">
                        {sv.paymentCompleted || sv.subscriptionPaid ? (
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                            {t('status.paid', 'Paid')}
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-500">
                            {t('status.unpaid', 'Unpaid')}
                          </span>
                        )}
                      </td>
                      <td className="p-5">
                        <button 
                          onClick={() => setSelectedChildId(sv._id)}
                          className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center justify-center w-fit"
                          title="View Details"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls 
            page={page} setPage={setPage} limit={limit}
            totalCount={status === 'paid' ? (counts.payment as any)?.paid : status === 'unpaid' ? (counts.payment as any)?.unpaid : ((counts.status as any)?.[status] || 0)}
          />
        </div>
        <RegisterPartnerModal 
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => fetchSubVendors()}
          role="sub_vendor"
          parentVendorId={vendorProfile?._id}
          vendorCode={vendorProfile?.vendorCode}
        />
        
        {/* Child Profile Modal */}
        <AnimatePresence>
          {selectedChildId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-secondary/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
              >
                <ChildProfileView 
                  childId={selectedChildId}
                  onClose={() => setSelectedChildId(null)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
