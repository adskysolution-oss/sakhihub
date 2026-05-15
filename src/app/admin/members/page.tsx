'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Users, Filter, Download, Search, CheckCircle, 
  Clock, MapPin, ShieldCheck, UserCircle, MessageSquare, Phone, X
} from "lucide-react";
import axios from "axios";
import AssignEmployeeModal from "@/components/features/dashboard/AssignEmployeeModal";

export default function MemberManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assigningTo, setAssigningTo] = useState<any>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/members?search=${search}`);
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusUpdate = async (id: string, accountStatus: string) => {
    try {
      const res = await axios.patch('/api/admin/members', { id, accountStatus });
      if (res.data.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update member status");
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
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by member, mobile or village..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f8f9fa' }}>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Member Details</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact & Location</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Assigned Employee</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Status & Group</th>
                    <th style={{ padding: '15px 20px', color: '#999', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading members from database...</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No members found in the platform registry.</td></tr>
                  ) : (
                    members.map((member) => (
                      <tr key={member._id} style={{ borderBottom: '1px solid #f8f9fa' }}>
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
                          {member.assignedEmployeeId ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--secondary)', margin: 0 }}>{member.assignedEmployeeId.fullName}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', margin: 0 }}>ID: {member.assignedEmployeeId.employeeId}</p>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>Unassigned</span>
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
