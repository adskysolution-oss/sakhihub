'use client';

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Search, MapPin, Phone, Mail, IndianRupee, ShieldCheck, ExternalLink } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
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

export default function VendorMembers() {
  const { t } = useLanguage();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [status, setStatus] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [counts, setCounts] = useState<any>({
    status: { all: 0, pending: 0, documents_uploaded: 0, reupload_required: 0, active: 0, approved: 0, unassigned: 0, rejected: 0, suspended: 0 },
    payment: { all: 0, paid: 0, unpaid: 0 }
  });
  const isFirstMount = useRef(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status,
        paymentStatus: paymentFilter,
        dateRange: dateFilter,
      });
      if (search) params.append('search', search);
      if (dateFilter === 'custom' && startDate) params.append('startDate', startDate);
      if (dateFilter === 'custom' && endDate) params.append('endDate', endDate);

      const res = await axios.get(`/api/vendor/members?${params.toString()}`);
      if (res.data.success) {
        setMembers(res.data.data);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status, dateFilter, paymentFilter, startDate, endDate]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      fetchMembers();
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, page, status, dateFilter, paymentFilter, startDate, endDate]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">All Members</h1>
          <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">Complete list of registered sakhis across your network hierarchy</p>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <UnifiedFilterBar
            search={search} setSearch={setSearch} searchPlaceholder="Search members by name, mobile or village..."
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
          />
          <StatusFilterTabs 
            status={status} 
            setStatus={setStatus} 
            paymentFilter={paymentFilter} 
            setPaymentFilter={setPaymentFilter} 
            counts={counts} 
          />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Profile</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Village & Pincode</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Membership</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Staff</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">Retrieving member records...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">No members found.</td></tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-black text-xl shadow-sm">
                            {member.name[0]}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{member.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">{member.mobile}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-xs text-gray-500 font-bold">
                        <MapPin size={12} className="inline mr-1 text-primary" /> {member.village}, {member.pincode}
                      </td>
                      <td className="p-5">
                         <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${member.membershipStatus?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                           {t('status.' + member.membershipStatus?.toLowerCase(), member.membershipStatus)}
                         </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-secondary">{member.assignedEmployeeId?.fullName || 'Direct'}</span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{member.assignedEmployeeId?.employeeId || ''}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        {(() => {
                          const badge = getStatusBadge(member.accountStatus || 'pending');
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              {t('status.' + (member.accountStatus || 'pending'), badge.label)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-5">
                        <button 
                          onClick={() => setSelectedChildId(member._id)}
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

          <div className="mt-8">
            <PaginationControls
              page={page}
              setPage={setPage}
              totalCount={counts.status[status] || 0}
              limit={limit}
            />
          </div>
        </div>

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
