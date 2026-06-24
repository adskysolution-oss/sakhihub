'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { 
  Users, UserCheck, ShieldAlert, Clock, Calendar, 
  ClipboardCheck, CheckCircle2, AlertTriangle, FileText, Check, X 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function HRMSDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hrms/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load HRMS dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Loading dashboard analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>HRMS Analytics Dashboard</h2>
            <p style={{ color: '#888' }}>Real-time field operations, attendance compliance, and leave request monitoring.</p>
          </div>
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => window.location.href = '/admin/hrms/attendance/exceptions'} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Exceptions Review Inbox
            </button>
            <button onClick={() => window.location.href = '/admin/hrms/settings'} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Shift Settings
            </button>
            <button onClick={() => window.location.href = '/admin/hrms/compliance-report'} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Compliance Report
            </button>
          </div>
        </div>

        {/* Attendance stats section */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>Attendance Logged Today</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }} className="max-md:grid-cols-2 max-sm:grid-cols-1">
            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#e8f5e9', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Present Today</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.attendance?.presentToday || 0}</h4>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#ffeebf', color: '#b57a00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Late Today</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.compliance?.lateTodayCount || 0}</h4>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#ede7f6', color: '#5e35b1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Half Day Today</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.compliance?.halfDayTodayCount || 0}</h4>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Absent Today</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.compliance?.absentTodayCount || (stats?.attendance?.absentToday || 0)}</h4>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Checkout Missing</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.attendance?.checkoutMissing || 0}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance and Escalation warnings */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>Attendance Warning Escalations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="max-md:grid-cols-2 max-sm:grid-cols-1">
            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #ffe0b2', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#fff3e0', color: '#e65100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>1st Warning</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.compliance?.warning1Count || 0}</h4>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #ffcc80', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#ffe0b2', color: '#f57c00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>2nd Warning</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.compliance?.warning2Count || 0}</h4>
              </div>
            </div>

            <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #e57373', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#ffebee', color: '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Penalty Pending</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#c62828', marginTop: '2px' }}>{stats?.compliance?.penaltyPendingCount || 0}</h4>
              </div>
            </div>

            <div onClick={() => window.location.href = '/admin/hrms/attendance/exceptions'} style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #ce93d8', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#f3e5f5', color: '#8e24aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={26} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: '800' }}>Pending Exceptions</p>
                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '2px' }}>{stats?.compliance?.exceptionsPendingReviewCount || 0}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="max-md:grid-cols-1">
          {/* Employee Metrics & Field Reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Employee count cards */}
            <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}><Users size={20} className="text-primary" /> Employee Directory Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ background: '#fcfcfc', border: '1px solid #f0f0f0', borderRadius: '20px', padding: '15px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Total Staff</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{stats?.employeeMetrics?.total || 0}</p>
                </div>
                <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '20px', padding: '15px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#2e7d32', fontWeight: '800', textTransform: 'uppercase' }}>Active</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2e7d32', marginTop: '5px' }}>{stats?.employeeMetrics?.active || 0}</p>
                </div>
                <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '20px', padding: '15px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#c62828', fontWeight: '800', textTransform: 'uppercase' }}>Suspended</p>
                  <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#c62828', marginTop: '5px' }}>{stats?.employeeMetrics?.suspended || 0}</p>
                </div>
              </div>
            </div>

            {/* Field reports metrics */}
            <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}><ClipboardCheck size={20} className="text-primary" /> Daily Field Activity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', background: '#fafafa', border: '1px solid #eee', borderRadius: '20px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Reports Submitted Today</p>
                  <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{stats?.fieldActivity?.submittedToday || 0}</h4>
                </div>
                <div style={{ padding: '20px', background: '#fafafa', border: '1px solid #eee', borderRadius: '20px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Reports Pending Today</p>
                  <h4 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', marginTop: '5px' }}>{stats?.fieldActivity?.pendingToday || 0}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Leave approvals stats */}
          <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f5f5f5', height: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Calendar size={20} className="text-primary" /> Leave Requests Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', height: '80%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: '#e3f2fd', borderRadius: '20px', border: '1px solid #bbdefb' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1565c0' }}>Pending Applications</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1565c0' }}>{stats?.leaveMetrics?.pending || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: '#e8f5e9', borderRadius: '20px', border: '1px solid #c8e6c9' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#2e7d32' }}>Approved Leaves</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2e7d32' }}>{stats?.leaveMetrics?.approved || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', background: '#ffebee', borderRadius: '20px', border: '1px solid #ffcdd2' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#c62828' }}>Rejected Leaves</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#c62828' }}>{stats?.leaveMetrics?.rejected || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
