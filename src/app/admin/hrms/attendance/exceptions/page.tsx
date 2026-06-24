'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Check, X, AlertCircle, Edit, Calendar, User, Clock, MapPin, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ExceptionReviewPage() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'late' | 'early'>('late');

  // Manual Adjustment Modal States
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [adjustCheckIn, setAdjustCheckIn] = useState('');
  const [adjustCheckOut, setAdjustCheckOut] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Remarks Prompt State (For Quick Actions)
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [remarksAction, setRemarksAction] = useState<'approve' | 'reject' | 'half_day' | null>(null);
  const [remarksText, setRemarksText] = useState('');

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hrms/attendance/exceptions');
      if (res.data.success) {
        setExceptions(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to fetch attendance exceptions under review.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  const handleQuickActionClick = (record: any, actionType: 'approve' | 'reject' | 'half_day') => {
    setSelectedRecord(record);
    setRemarksAction(actionType);
    setRemarksText('');
    setRemarksModalOpen(true);
  };

  const submitQuickAction = async () => {
    if (!selectedRecord || !remarksAction) return;

    setActionLoading(true);
    try {
      const res = await axios.patch(`/api/hrms/attendance/exceptions/${selectedRecord._id}`, {
        action: remarksAction,
        exceptionType: activeTab,
        adminRemarks: remarksText
      });

      if (res.data.success) {
        toast.success(`Exception ${remarksAction}d successfully.`);
        setRemarksModalOpen(false);
        setSelectedRecord(null);
        setRemarksAction(null);
        fetchExceptions();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustClick = (record: any) => {
    setSelectedRecord(record);
    
    // Pre-populate time strings (HH:MM) in local time
    const formatTimeForInput = (dateStr?: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    };

    setAdjustCheckIn(formatTimeForInput(record.checkInTime));
    setAdjustCheckOut(formatTimeForInput(record.checkOutTime));
    setAdjustReason('');
    setAdjustModalOpen(true);
  };

  const submitAdjustment = async () => {
    if (!selectedRecord || !adjustReason.trim()) {
      toast.error('Adjustment reason is required.');
      return;
    }

    setActionLoading(true);
    try {
      // Helper to combine record date YYYY-MM-DD and input time HH:MM
      const combineDateAndTime = (dateStr: string, timeStr: string) => {
        if (!timeStr) return null;
        return new Date(`${dateStr}T${timeStr}:00`);
      };

      const newCheckIn = combineDateAndTime(selectedRecord.date, adjustCheckIn);
      const newCheckOut = combineDateAndTime(selectedRecord.date, adjustCheckOut);

      const res = await axios.patch(`/api/hrms/attendance/exceptions/${selectedRecord._id}`, {
        action: 'adjust',
        newCheckInTime: newCheckIn,
        newCheckOutTime: newCheckOut,
        adjustReason
      });

      if (res.data.success) {
        toast.success('Record adjusted successfully.');
        setAdjustModalOpen(false);
        setSelectedRecord(null);
        fetchExceptions();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Adjustment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter exceptions based on active tab
  const filteredRecords = exceptions.filter(r => {
    if (activeTab === 'late') {
      return r.lateReason && r.lateReason.reviewStatus === 'Pending';
    } else {
      return r.isMajorEarlyCheckout && r.earlyCheckoutReviewStatus === 'Pending';
    }
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Loading exceptions inbox...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Breadcrumb */}
        <div>
          <button 
            onClick={() => window.location.href = '/admin/hrms/dashboard'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Exceptions Review Inbox</h2>
            <p style={{ color: '#888' }}>Review late arrival explanations and major early checkout justifications submitted by field team employees.</p>
          </div>
        </div>

        {/* Tabs Row */}
        <div style={{ display: 'flex', borderBottom: '2px solid #eee', gap: '30px' }}>
          <button 
            onClick={() => setActiveTab('late')}
            style={{ 
              padding: '12px 10px', 
              fontWeight: '800', 
              fontSize: '1rem', 
              color: activeTab === 'late' ? 'var(--primary)' : '#666', 
              borderBottom: activeTab === 'late' ? '3px solid var(--primary)' : 'none', 
              background: 'none', 
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer' 
            }}
          >
            Late Check-Ins ({exceptions.filter(r => r.lateReason?.reviewStatus === 'Pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('early')}
            style={{ 
              padding: '12px 10px', 
              fontWeight: '800', 
              fontSize: '1rem', 
              color: activeTab === 'early' ? 'var(--primary)' : '#666', 
              borderBottom: activeTab === 'early' ? '3px solid var(--primary)' : 'none', 
              background: 'none', 
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer' 
            }}
          >
            Major Early Checkouts ({exceptions.filter(r => r.isMajorEarlyCheckout && r.earlyCheckoutReviewStatus === 'Pending').length})
          </button>
        </div>

        {/* Records Display List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredRecords.map((record) => (
            <div key={record._id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr', gap: '20px', padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }} className="max-md:grid-cols-1">
              
              {/* Employee Column */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ width: '55px', height: '55px', borderRadius: '18px', background: 'rgba(233,30,99,0.06)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                  {record.employeeId?.fullName?.charAt(0) || <User size={24} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--secondary)' }}>{record.employeeId?.fullName || 'Unknown User'}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>ID: {record.employeeId?.employeeId || 'N/A'}</p>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>{record.employeeId?.designation || 'Staff'}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>{record.employeeId?.department || 'Operations'}</p>
                </div>
              </div>

              {/* Exception Details Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid #eee', borderRight: '1px solid #eee', padding: '0 25px' }} className="max-md:border-none max-md:p-0">
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}><Calendar size={14} /> {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}><Clock size={14} /> Logged: {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'} - {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                </div>

                {activeTab === 'late' ? (
                  <div style={{ background: '#fff9c4', border: '1px solid #fff59d', padding: '12px 15px', borderRadius: '16px', marginTop: '5px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#f57f17' }}>Late Reason Category: {record.lateReason?.category}</p>
                    <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>"{record.lateReason?.explanation}"</p>
                  </div>
                ) : (
                  <div style={{ background: '#f3e5f5', border: '1px solid #e1bee7', padding: '12px 15px', borderRadius: '16px', marginTop: '5px' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#7b1fa2' }}>Major Early Checkout</p>
                    <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px', fontStyle: 'italic' }}>"{record.earlyCheckOutReason || 'No reason provided'}"</p>
                  </div>
                )}
              </div>

              {/* Actions Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleQuickActionClick(record, 'approve')}
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px', fontSize: '0.8rem', justifyContent: 'center', gap: '5px', color: '#2e7d32', background: '#e8f5e9', border: '1px solid #c8e6c9' }}
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => handleQuickActionClick(record, 'reject')}
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px', fontSize: '0.8rem', justifyContent: 'center', gap: '5px', color: '#c62828', background: '#ffebee', border: '1px solid #ffcdd2' }}
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleQuickActionClick(record, 'half_day')}
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px', fontSize: '0.8rem', justifyContent: 'center', gap: '5px', color: '#e65100', background: '#fff3e0', border: '1px solid #ffe0b2' }}
                  >
                    <AlertCircle size={16} /> Half Day
                  </button>
                  <button 
                    onClick={() => handleAdjustClick(record)}
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px', fontSize: '0.8rem', justifyContent: 'center', gap: '5px', color: '#1565c0', background: '#e3f2fd', border: '1px solid #bbdefb' }}
                  >
                    <Edit size={16} /> Adjust
                  </button>
                </div>
              </div>

            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', color: '#aaa', fontStyle: 'italic' }}>
              No pending {activeTab} exceptions under review for this period.
            </div>
          )}
        </div>
      </div>

      {/* Remarks Modal for Approve/Reject/Half Day */}
      {remarksModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '10px', textTransform: 'capitalize' }}>
              Confirm {remarksAction} Action
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>
              Employee: <strong>{selectedRecord?.employeeId?.fullName}</strong> ({selectedRecord?.date})
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#555', display: 'block', marginBottom: '6px' }}>Admin Remarks / Explanation</label>
              <textarea
                rows={3}
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                placeholder="Write reason or remarks here..."
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none', resize: 'none' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setRemarksModalOpen(false)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading}
                onClick={submitQuickAction}
                className="btn-primary" 
                style={{ flex: 1, padding: '12px', justifyContent: 'center', textTransform: 'capitalize' }}
              >
                {actionLoading ? 'Processing...' : remarksAction}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Time Adjustments Modal */}
      {adjustModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '30px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '10px' }}>Manual Attendance Adjustment</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>
              Update exact check-in / check-out times. Setting times correctly will automatically write to the audit collection.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#555', display: 'block', marginBottom: '6px' }}>Check-In Time</label>
                  <input
                    type="time"
                    value={adjustCheckIn}
                    onChange={(e) => setAdjustCheckIn(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#555', display: 'block', marginBottom: '6px' }}>Check-Out Time</label>
                  <input
                    type="time"
                    value={adjustCheckOut}
                    onChange={(e) => setAdjustCheckOut(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ccc', outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#555', display: 'block', marginBottom: '6px' }}>Reason for Override (Audit Log)</label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Explain why this adjustment is being made..."
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setAdjustModalOpen(false)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button 
                disabled={actionLoading || !adjustReason.trim()}
                onClick={submitAdjustment}
                className="btn-primary" 
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                {actionLoading ? 'Saving...' : 'Apply adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
