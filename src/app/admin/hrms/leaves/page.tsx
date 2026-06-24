'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Search, Calendar, FileText, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLeavesApprovalPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchEmployee, setSearchEmployee] = useState('');

  // Rejection modal state
  const [rejectingLeave, setRejectingLeave] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actioning, setActioning] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/hrms/leaves?status=${statusFilter}`);
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to approve the leave request for ${name}?`)) return;

    try {
      const res = await axios.patch(`/api/hrms/leaves/${id}`, {
        status: 'Approved'
      });

      if (res.data.success) {
        toast.success(`Leave request for ${name} approved successfully!`);
        fetchLeaves();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve leave.');
    }
  };

  const handleOpenReject = (leave: any) => {
    setRejectingLeave(leave);
    setRejectionReason('');
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }

    setActioning(true);
    try {
      const res = await axios.patch(`/api/hrms/leaves/${rejectingLeave._id}`, {
        status: 'Rejected',
        rejectionReason
      });

      if (res.data.success) {
        toast.success(`Leave request for ${rejectingLeave.employeeId.fullName} rejected.`);
        setRejectingLeave(null);
        fetchLeaves();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject leave.');
    } finally {
      setActioning(false);
    }
  };

  // Local filter for search box
  const filteredLeaves = leaves.filter(leave => {
    const emp = leave.employeeId;
    if (!emp) return false;
    const name = emp.fullName || '';
    const mobile = emp.mobile || '';
    const code = emp.employeeId || '';
    const q = searchEmployee.toLowerCase();
    return name.toLowerCase().includes(q) || mobile.includes(q) || code.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Employee Leave Requests</h2>
            <p style={{ color: '#888' }}>Review submitted leave requests, audit attachments, and log approvals.</p>
          </div>
          <button onClick={fetchLeaves} className="btn-secondary" style={{ padding: '10px 15px', gap: '5px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="max-sm:flex-col max-sm:items-stretch">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search employee by name, mobile, ID..."
              value={searchEmployee}
              onChange={(e) => setSearchEmployee(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem' }}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '12px 20px', borderRadius: '16px', border: '1px solid #eee', background: 'white', fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}
            >
              <option value="Pending">Pending Approvals</option>
              <option value="Approved">Approved Leaves</option>
              <option value="Rejected">Rejected Leaves</option>
              <option value="all">All Applications</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <p>Loading leave applications...</p>
          ) : filteredLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <Calendar size={48} style={{ color: '#eee', marginBottom: '15px' }} />
              <p style={{ fontStyle: 'italic' }}>No leave applications found matching filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Employee Profile</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Leave Type</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Duration</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Reason</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Attachment</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Action / Auditor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => {
                    const emp = leave.employeeId;
                    return (
                      <tr key={leave._id} style={{ borderBottom: '1px solid #fafafa' }}>
                        <td style={{ padding: '15px 12px' }}>
                          {emp ? (
                            <div>
                              <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--secondary)' }}>{emp.fullName}</p>
                              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>{emp.employeeId || 'STF'} | {emp.designation}</p>
                              <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '2.5px' }}>{emp.block}, {emp.district}</p>
                            </div>
                          ) : (
                            <span style={{ color: '#aaa', fontStyle: 'italic' }}>Unknown User</span>
                          )}
                        </td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--secondary)' }}>{leave.leaveType}</td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem', color: '#555' }}>
                          <div>{new Date(leave.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(leave.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                            {Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                          </div>
                        </td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>{leave.reason}</td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem' }}>
                          {leave.attachment ? (
                            <a href={leave.attachment} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> View File</a>
                          ) : (
                            <span style={{ color: '#ccc' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '15px 12px', fontSize: '0.85rem' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            padding: '5px 10px',
                            borderRadius: '8px',
                            textTransform: 'uppercase',
                            background: leave.status === 'Approved' ? '#e8f5e9' : leave.status === 'Rejected' ? '#ffebee' : '#e3f2fd',
                            color: leave.status === 'Approved' ? '#2e7d32' : leave.status === 'Rejected' ? '#c62828' : '#1565c0'
                          }}>
                            {leave.status}
                          </span>
                        </td>
                        <td style={{ padding: '15px 12px' }}>
                          {leave.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button
                                onClick={() => handleApprove(leave._id, emp?.fullName || 'Employee')}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#2e7d32', gap: '4px' }}
                              >
                                <Check size={12} /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenReject(leave)}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#c62828', gap: '4px' }}
                              >
                                <X size={12} /> Reject
                              </button>
                            </div>
                          ) : leave.status === 'Approved' ? (
                            <div style={{ fontSize: '0.8rem', color: '#2e7d32' }}>Approved by {leave.approvedBy?.fullName || 'Admin'}</div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#c62828' }}>
                              <p style={{ fontWeight: '700' }}>Rejected</p>
                              <p style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '2px' }}>Reason: {leave.rejectionReason}</p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rejection dialog */}
        <AnimatePresence>
          {rejectingLeave && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setRejectingLeave(null)}
                style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 40 }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '480px', background: 'white', padding: '30px', borderRadius: '32px', zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={20} className="text-primary" /> Reject Leave Application</h3>
                  <button onClick={() => setRejectingLeave(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleRejectSubmit}>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
                    Please explain the reason for rejecting the leave request of <strong>{rejectingLeave.employeeId?.fullName}</strong>.
                  </p>
                  <textarea
                    rows={4}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'none', marginBottom: '20px' }}
                  />

                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setRejectingLeave(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
                    <button type="submit" disabled={actioning} className="btn-primary" style={{ padding: '10px 25px', background: '#c62828' }}>
                      {actioning ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
