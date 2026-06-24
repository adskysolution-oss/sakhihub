'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Calendar, Plus, FileText, CheckCircle, AlertCircle, X, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applying, setApplying] = useState(false);

  // Form states
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hrms/leaves');
      if (res.data.success) {
        setLeaves(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setAttachmentName(file.name);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const res = await axios.post('/api/upload', {
            image: base64String,
            folder: 'leave_attachments',
            originalName: file.name
          });

          if (res.data.success) {
            setAttachment(res.data.data.url);
            toast.success('Attachment uploaded successfully!');
          }
        } catch (err) {
          toast.error('Upload failed. Please try again.');
          setAttachmentName('');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      toast.error('Please fill in all mandatory fields.');
      return;
    }

    setApplying(true);
    try {
      const res = await axios.post('/api/hrms/leaves', {
        leaveType,
        fromDate,
        toDate,
        reason,
        attachment
      });

      if (res.data.success) {
        toast.success('Leave applied successfully!');
        setShowApply(false);
        setLeaveType('Casual Leave');
        setFromDate('');
        setToDate('');
        setReason('');
        setAttachment(null);
        setAttachmentName('');
        fetchLeaves();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Leave Management</h2>
            <p style={{ color: '#888' }}>Apply for leaves, upload medical attachments, and track approval status.</p>
          </div>
          {!showApply && (
            <button onClick={() => setShowApply(true)} className="btn-primary" style={{ gap: '8px' }}>
              <Plus size={20} /> Apply For Leave
            </button>
          )}
        </div>

        {/* Apply Panel */}
        {showApply && (
          <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #eee', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)' }}>New Leave Application</h3>
              <button onClick={() => setShowApply(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="max-md:grid-cols-1">
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }} className="max-md:col-span-1">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>From Date *</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>To Date *</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }} className="max-md:col-span-1">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Reason *</label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you are applying for leave..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #ddd', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }} className="max-md:col-span-1">
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--secondary)', display: 'block', marginBottom: '8px' }}>Attachment (Optional)</label>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    style={{ position: 'absolute', left: 0, top: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ width: '100%', padding: '15px', border: '1px dashed #bbb', borderRadius: '16px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#666', fontSize: '0.85rem' }}>
                    <Upload size={18} />
                    <span>{uploading ? 'Uploading...' : attachmentName || 'Upload medical certificate, receipt, or letter...'}</span>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '15px', justifyContent: 'flex-end' }} className="max-md:col-span-1">
                <button type="button" onClick={() => setShowApply(false)} className="btn-secondary" style={{ padding: '12px 25px' }}>Cancel</button>
                <button type="submit" disabled={applying || uploading} className="btn-primary" style={{ padding: '12px 30px' }}>
                  {applying ? 'Submitting...' : 'Apply Now'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leave Requests Table */}
        <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px' }}>Leave Applications History</h3>

          {loading ? (
            <p>Loading leaves list...</p>
          ) : leaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
              <Calendar size={48} style={{ color: '#eee', marginBottom: '15px' }} />
              <p style={{ fontStyle: 'italic' }}>No leave applications filed yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Leave Type</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Duration</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Reason</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Attachment</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px', fontSize: '0.75rem', fontWeight: '800', color: '#aaa', textTransform: 'uppercase' }}>Remarks / Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id} style={{ borderBottom: '1px solid #fafafa' }}>
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
                      <td style={{ padding: '15px 12px', fontSize: '0.8rem', color: '#666' }}>
                        {leave.status === 'Approved' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2e7d32' }}><CheckCircle size={14} /> Approved by Admin</div>
                        )}
                        {leave.status === 'Rejected' && (
                          <div style={{ color: '#c62828' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}><AlertCircle size={14} /> Rejected</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '2px', fontStyle: 'italic' }}>Reason: {leave.rejectionReason}</div>
                          </div>
                        )}
                        {leave.status === 'Pending' && <span style={{ color: '#888', fontStyle: 'italic' }}>Review pending...</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
