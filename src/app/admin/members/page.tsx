'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Users, Filter, Download, Search, CheckCircle, 
  Clock, MapPin, ShieldCheck, UserCircle, MessageSquare, Phone, X
} from "lucide-react";
import axios from "axios";
import AssignEmployeeModal from "@/components/features/dashboard/AssignEmployeeModal";
import { toast } from 'sonner';
import { getProxiedImageUrl } from '@/utils/imageUrl';

export default function MemberManagement() {
  const [members, setMembers] = useState<any[]>([]);
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
  const [assigningTo, setAssigningTo] = useState<any>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/members?status=${status}&search=${search}&dateRange=${dateFilter}&paymentStatus=${paymentFilter}&customDate=${customDate}&startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`);
      if (res.data.success) {
        setMembers(res.data.data);
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
  }, [search, status, dateFilter, paymentFilter, customDate, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, status, dateFilter, paymentFilter, customDate, startDate, endDate, page]);

  const handleStatusUpdate = async (id: string, accountStatus: string) => {
    try {
      const res = await axios.patch('/api/admin/members', { id, accountStatus });
      if (res.data.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update member status");
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="p-2 md:p-4">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-10 gap-5">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-secondary leading-tight">Members Directory</h2>
              <p className="text-gray-500 text-sm md:text-lg mt-1">Global registry of all women members and their membership compliance.</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
              <button className="btn-secondary py-3 px-6 text-sm flex-1 md:flex-none justify-center">
                <Download size={16} /> Export Excel
              </button>
              <button className="btn-primary py-3 px-6 text-sm flex-1 md:flex-none justify-center">
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>

          <div className="glass-card p-4 md:p-8 bg-white rounded-3xl shadow-soft">
            <div className="flex gap-4 mb-8 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by member, mobile or village..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                 {['all', 'pending', 'documents_uploaded', 'under_review', 'reupload_required', 'active', 'rejected', 'paid', 'unpaid'].map((s) => {
                   const labelMap: Record<string, string> = {
                     all: 'All',
                     pending: 'Pending',
                     documents_uploaded: 'Docs Submitted',
                     under_review: 'Review',
                     reupload_required: 'Re-upload',
                     active: 'Active',
                     rejected: 'Rejected',
                     paid: 'Paid',
                     unpaid: 'Unpaid/Free'
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

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', width: '60px' }}>S.No.</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Member Details</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact & Location</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Assigned Employee</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status & Group</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading members from database...</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No members found in the platform registry.</td></tr>
                  ) : (
                    members.map((member, index) => (
                      <tr key={member._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '15px 20px', fontSize: '0.8rem', fontWeight: '800', color: '#999' }}>
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF5F8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                              {member.name[0]}
                            </div>
                            <div>
                              <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--secondary)', margin: 0 }}>{member.name}</p>
                              <p style={{ fontSize: '0.75rem', color: '#999', margin: '2px 0 0' }}>ID: {member.membershipId || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="var(--primary)" /> {member.mobile}</span>
                            <span style={{ fontSize: '0.8rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} color="var(--primary)" /> {member.block}, {member.district} ({member.pincode})
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          {member.assignedEmployeeId && typeof member.assignedEmployeeId === 'object' && member.assignedEmployeeId.fullName ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>{member.assignedEmployeeId.fullName}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', margin: 0 }}>ID: {member.assignedEmployeeId.employeeId || 'N/A'}</p>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>
                              {member.assignedEmployeeId && typeof member.assignedEmployeeId === 'string' ? `ID: ${member.assignedEmployeeId}` : 'Unassigned'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ 
                              padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                              background: member.accountStatus === 'active' ? '#ecfdf5' : member.accountStatus === 'pending' ? '#fffbeb' : '#fef2f2',
                              color: member.accountStatus === 'active' ? '#059669' : member.accountStatus === 'pending' ? '#d97706' : '#dc2626',
                              width: 'fit-content', textTransform: 'uppercase'
                            }}>
                              {member.accountStatus || 'pending'}
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: member.groupId ? 'var(--secondary)' : '#999' }}>
                              {member.groupId?.groupName || 'No Group'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div className="flex gap-2">
                            {member.accountStatus === 'pending' && (
                              <button 
                                onClick={() => handleStatusUpdate(member._id, 'active')}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all shadow-sm"
                                title="Approve Member"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {member.accountStatus === 'active' && (
                              <button 
                                onClick={() => handleStatusUpdate(member._id, 'suspended')}
                                className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-all shadow-sm"
                                title="Suspend Member"
                              >
                                <Clock size={18} />
                              </button>
                            )}
                            {member.accountStatus === 'suspended' && (
                              <button 
                                onClick={() => handleStatusUpdate(member._id, 'active')}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm"
                                title="Restore Member"
                              >
                                <ShieldCheck size={18} />
                              </button>
                            )}
                            {member.accountStatus === 'rejected' && (
                              <button 
                                onClick={() => handleStatusUpdate(member._id, 'active')}
                                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all shadow-sm"
                                title="Reactivate Member"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {member.accountStatus !== 'rejected' && (
                              <button 
                                onClick={() => handleStatusUpdate(member._id, 'rejected')}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
                                title="Reject Member"
                              >
                                <X size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => setAssigningTo(member)}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all shadow-sm"
                              title="Assign Employee"
                            >
                              <UserCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
        </div>
      </DashboardLayout>

      {assigningTo && (
        <AssignEmployeeModal 
          member={assigningTo} 
          onClose={(assigned) => {
            setAssigningTo(null);
            if (assigned) fetchMembers();
          }} 
        />
      )}
    </>
  );
}
