'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import DailyReportForm from "@/components/features/dashboard/DailyReportForm";
import { Plus, Search, Calendar, ClipboardCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import axios from "axios";

export default function EmployeeReportsPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports/daily');
      if (res.data.success) setReports(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (showAdd) {
    return (
      <DashboardLayout>
        <DailyReportForm onCancel={() => setShowAdd(false)} onSuccess={() => { setShowAdd(false); fetchReports(); }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Daily Activity Reports</h2>
          <p style={{ color: 'var(--text-muted)' }}>Log your daily work and track your field performance.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ gap: '10px' }}>
          <Plus size={20} /> Submit New Report
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.map((report) => (
          <div key={report._id} style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f5f5f5', overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', alignItems: 'center', gap: '30px', minWidth: '700px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '55px', height: '55px', background: 'rgba(233, 30, 99, 0.1)', color: 'var(--primary)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Calendar size={26} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{new Date(report.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{report.status.toUpperCase()}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: '700' }}>Groups</p>
                   <p style={{ margin: '5px 0 0', fontSize: '1.2rem', fontWeight: '900' }}>{report.groupsCreated}</p>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: '700' }}>Members</p>
                   <p style={{ margin: '5px 0 0', fontSize: '1.2rem', fontWeight: '900' }}>{report.membersAdded}</p>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: '700' }}>Collection</p>
                   <p style={{ margin: '5px 0 0', fontSize: '1.2rem', fontWeight: '900' }}>₹{report.membershipCollected}</p>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ margin: 0, fontSize: '0.8rem', color: '#888', fontWeight: '700' }}>Inquiries</p>
                   <p style={{ margin: '5px 0 0', fontSize: '1.2rem', fontWeight: '900' }}>{report.padsInquiry}</p>
                 </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                 {report.status === 'verified' && <span style={{ color: '#10b981', background: '#f0fdf4', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle2 size={16} /> Verified</span>}
                 <button style={{ color: '#666', background: '#f8f9fa', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: '700', cursor: 'pointer' }}>View Details</button>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '30px' }}>
             <ClipboardCheck size={60} color="#eee" style={{ marginBottom: '20px' }} />
             <h3 style={{ color: '#999' }}>No reports submitted yet.</h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
