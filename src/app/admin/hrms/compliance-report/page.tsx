'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Calendar, User, Clock, AlertTriangle, FileText, CheckCircle2, Award, Info, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function ComplianceReportPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  
  // Format current year and month to YYYY-MM
  const getCurrentMonthStr = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}`;
  };

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch employees on mount
  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/hrms/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load employee list.');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = { month: selectedMonth };
      if (selectedEmployee !== 'all') {
        params.employeeId = selectedEmployee;
      }

      const res = await axios.get('/api/hrms/compliance-report', { params });
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate compliance report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedEmployee]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#2e7d32'; // Green
    if (score >= 75) return '#f57c00'; // Orange
    return '#c62828'; // Red
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return '#e8f5e9';
    if (score >= 75) return '#fff3e0';
    return '#ffebee';
  };

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

        {/* Header and Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Monthly Compliance & Payroll Report</h2>
            <p style={{ color: '#888' }}>Punctuality, checkout metrics, late count frequencies, and payroll integration scores.</p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {/* Month select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#666' }}>SELECT MONTH</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none' }}
              />
            </div>

            {/* Employee select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#666' }}>FILTER BY EMPLOYEE</span>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid #ccc', outline: 'none', minWidth: '200px' }}
              >
                <option value="all">All Scoped Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.employeeId || 'No ID'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Calculating compliance metrics...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Upper Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }} className="max-md:grid-cols-1">
              
              {/* Compliance Circular Gauge Card */}
              <div style={{ padding: '30px', background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px' }}>Compliance Rating Score</h3>
                
                <div style={{ 
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  background: getScoreBg(report?.complianceScore || 0), 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: `4px solid ${getScoreColor(report?.complianceScore || 0)}`,
                  marginBottom: '20px'
                }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: '950', color: getScoreColor(report?.complianceScore || 0) }}>
                    {report?.complianceScore || 0}%
                  </span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#666', maxWidth: '280px' }}>
                  {report?.complianceScore >= 90 ? 'Excellent team execution. High punctuality and regular checkout patterns.' :
                   report?.complianceScore >= 75 ? 'Moderate punctuality. Review consecutive late dates and exceptions.' :
                   'Low compliance score. Corrective check-ins or override actions recommended.'}
                </p>
              </div>

              {/* Attendance metrics counts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>Attendance Log Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }} className="max-sm:grid-cols-2">
                    <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: '800' }}>Present</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2e7d32', marginTop: '5px' }}>{report?.stats?.totalPresent || 0}</p>
                    </div>
                    <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#e65100', fontWeight: '800' }}>Late Arrivals</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#e65100', marginTop: '5px' }}>{report?.stats?.totalLate || 0}</p>
                    </div>
                    <div style={{ background: '#ede7f6', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#5e35b1', fontWeight: '800' }}>Half Days</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#5e35b1', marginTop: '5px' }}>{report?.stats?.totalHalfDay || 0}</p>
                    </div>
                    <div style={{ background: '#ffebee', padding: '15px', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: '#c62828', fontWeight: '800' }}>Absents</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#c62828', marginTop: '5px' }}>{report?.stats?.totalAbsent || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Timing statistics */}
                <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>Check-In & Check-Out Timings</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }} className="max-sm:grid-cols-2">
                    <div style={{ padding: '12px', background: '#fafafa', borderRadius: '14px', border: '1px solid #eee', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800' }}>Avg Check-In</p>
                      <p style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{report?.averages?.avgCheckIn || '--:--'}</p>
                    </div>
                    <div style={{ padding: '12px', background: '#fafafa', borderRadius: '14px', border: '1px solid #eee', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800' }}>Avg Check-Out</p>
                      <p style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{report?.averages?.avgCheckOut || '--:--'}</p>
                    </div>
                    <div style={{ padding: '12px', background: '#fafafa', borderRadius: '14px', border: '1px solid #eee', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800' }}>Total Late Min</p>
                      <p style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--primary)', marginTop: '5px' }}>{report?.averages?.totalLateMinutes || 0} m</p>
                    </div>
                    <div style={{ padding: '12px', background: '#fafafa', borderRadius: '14px', border: '1px solid #eee', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.7rem', color: '#888', fontWeight: '800' }}>Avg Late Min</p>
                      <p style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--primary)', marginTop: '5px' }}>{report?.averages?.avgLateMinutes || 0} m</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Qualitative analysis (Common late/early reasons) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className="max-md:grid-cols-1">
              <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#ffeebf', color: '#b57a00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={26} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Most Common Late Reason</h4>
                  <p style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{report?.mostCommonLateReason || 'None'}</p>
                </div>
              </div>

              <div style={{ padding: '25px', background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.01)' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: '#f3e5f5', color: '#8e24aa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={26} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: '#888', fontWeight: '800', textTransform: 'uppercase' }}>Most Common Early Checkout</h4>
                  <p style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{report?.mostCommonEarlyCheckoutReason || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Dynamic visual tips banner */}
            <div style={{ padding: '20px 25px', background: '#e8eaf6', borderRadius: '24px', border: '1px solid #c5cae9', display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Award size={36} style={{ color: '#3f51b5', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#1a237e' }}>Compliance Performance Note</h4>
                <p style={{ fontSize: '0.8rem', color: '#3f51b5', marginTop: '2px' }}>
                  Payroll calculations use a unified 1.0 coefficient for on-time Present or approved Late days. Half day penalties reduce score to 0.5. Penalty Pending logs must be approved or penalized before finalized payroll export.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
