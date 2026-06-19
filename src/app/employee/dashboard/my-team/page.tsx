'use client';

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { Briefcase, MapPin, ClipboardList, ExternalLink } from "lucide-react";
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

export default function MyTeamPage() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchEmployees = async () => {
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

      const res = await axios.get(`/api/employee/my-team?${params.toString()}`);
      if (res.data.success || res.status === 200) {
        setEmployees(res.data.data || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Error fetching employee team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, page, status, dateFilter, startDate, endDate]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <header className="flex justify-between items-start flex-wrap gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary">My Team</h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
              View and coordinate all Block coordinators operating in your assigned blocks
            </p>
          </div>
        </header>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
          <UnifiedFilterBar
            search={search} setSearch={setSearch} searchPlaceholder="Search by name, ID or mobile..."
            dateFilter={dateFilter} setDateFilter={setDateFilter}
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
          />
          <StatusFilterTabs status={status} setStatus={setStatus} counts={counts as any} />

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-left border-b-2 border-gray-50">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Block Coordinator</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Designation</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Block (Workplace)</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Affiliation</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">
                      Loading team members...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-400 font-bold italic">
                      No block employee coordinates found in your assigned blocks.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="p-5">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xl shadow-sm">
                            {emp.fullName ? emp.fullName[0] : 'BC'}
                          </div>
                          <div>
                            <p className="font-black text-secondary leading-tight">{emp.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                              {emp.employeeId || 'ID Pending'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-xs font-black text-secondary">
                          <Briefcase size={14} className="text-gray-400" />
                          <span>{emp.designation || 'Block Coordinator'}</span>
                        </div>
                      </td>
                      <td className="p-5 text-xs text-secondary font-black">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-primary" />
                          <span>{emp.workBlock || emp.block || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-secondary">
                            {emp.parentVendorId?.fullName || 'Direct Affiliated'}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        {(() => {
                          const badge = getStatusBadge(emp.status);
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.className}`}>
                              {t('status.' + emp.status, badge.label)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedChildId(emp._id)}
                            className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center justify-center w-fit"
                            title="View Profile"
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

          <PaginationControls
            page={page} setPage={setPage} limit={limit}
            totalCount={(counts.status as any)?.[status] || 0}
          />
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
