'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  BarChart, PieChart, TrendingUp, Download, 
  Calendar, Users, IndianRupee, Map, Award,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import axios from "axios";

export default function AdminReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/admin/reports');
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <DashboardLayout><div style={{ padding: '50px', textAlign: 'center' }}>Generating real-time intelligence reports...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)' }}>Analytics & Reports</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Comprehensive breakdown of community growth, collection metrics, and field performance.</p>
        </div>
        <button className="btn-primary" style={{ padding: '15px 35px', display: 'flex', gap: '10px' }}>
           <Download size={20} /> Download Master Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
         {/* Monthly Growth */}
         <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <TrendingUp size={22} color="var(--primary)" /> Registration Growth
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {data?.monthlyRegs?.map((m: any) => (
                 <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ width: '80px', fontSize: '0.9rem', fontWeight: '700', color: '#666' }}>Month {m._id}</span>
                    <div style={{ flex: 1, height: '30px', background: '#f8f9fa', borderRadius: '10px', overflow: 'hidden' }}>
                       <div style={{ width: `${Math.min(m.count * 5, 100)}%`, height: '100%', background: 'var(--grad-primary)' }}></div>
                    </div>
                    <span style={{ fontWeight: '800', color: 'var(--secondary)' }}>{m.count} Members</span>
                 </div>
               ))}
               {!data?.monthlyRegs?.length && <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Insufficient data for trend analysis.</p>}
            </div>
         </div>

         {/* Collection Metrics */}
         <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <IndianRupee size={22} color="#059669" /> Revenue Streams
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               {data?.monthlyCollections?.map((m: any) => (
                 <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ width: '80px', fontSize: '0.9rem', fontWeight: '700', color: '#666' }}>Month {m._id}</span>
                    <div style={{ flex: 1, height: '30px', background: '#f0fdf4', borderRadius: '10px', overflow: 'hidden' }}>
                       <div style={{ width: `${Math.min(m.total / 1000, 100)}%`, height: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}></div>
                    </div>
                    <span style={{ fontWeight: '800', color: '#059669' }}>₹{m.total.toLocaleString()}</span>
                 </div>
               ))}
               {!data?.monthlyCollections?.length && <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No revenue data recorded yet.</p>}
            </div>
         </div>
      </div>

      {/* Employee Leaderboard */}
      <div className="glass-card" style={{ background: 'white', padding: '35px', borderRadius: '35px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
         <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} color="#f59e0b" /> Field Efficiency Leaderboard
         </h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {data?.employeePerformance?.map((perf: any, i: number) => (
               <div key={perf._id} style={{ padding: '25px', borderRadius: '25px', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '20px', background: i === 0 ? '#fffcf0' : 'white' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: i === 0 ? '#f59e0b' : '#f5f5f5', color: i === 0 ? 'white' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                     {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                     <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--secondary)' }}>{perf.employeeName}</h4>
                     <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#999' }}>{perf.mobile}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: 'var(--primary)' }}>{perf.membersCount}</p>
                     <p style={{ margin: 0, fontSize: '0.7rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Members Added</p>
                  </div>
               </div>
            ))}
            {!data?.employeePerformance?.length && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>No performance data available yet.</div>}
         </div>
      </div>
    </DashboardLayout>
  );
}
