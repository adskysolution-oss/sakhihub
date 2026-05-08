'use client';

import React from 'react';
import { 
  Users, UserCheck, UserPlus, IndianRupee, 
  Map, Layout, Bell, BarChart3, 
  Clock, ShieldAlert, CheckCircle2, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';

export default function SuperAdminDashboard({ stats: data }: { stats?: any }) {
  const stats = [
    { label: "Total Employees", value: data?.stats?.totalEmployees || "0", icon: Users, color: "#6a1b9a", trend: "+0%" },
    { label: "Active Groups", value: data?.stats?.totalGroups || "0", icon: Layout, color: "#e91e63", trend: "+0%" },
    { label: "Total Members", value: data?.stats?.totalMembers || "0", icon: UserPlus, color: "#2e7d32", trend: "+0%" },
    { label: "Collections", value: `₹${(data?.stats?.totalCollections || 0).toLocaleString()}`, icon: IndianRupee, color: "#ef6c00", trend: "+0%" },
  ];

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await axios.patch(`/api/admin/employees/${id}/status`, { status });
      if (res.data.success) {
        window.location.reload(); // Quick refresh to show updated stats
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: 'white', 
              padding: '25px', 
              borderRadius: '24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={26} />
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', margin: 0 }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Pending Approvals & Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        {/* Pending Approvals */}
        <div style={{ background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={22} color="#f59e0b" /> Pending Employee Approvals ({data?.pendingApplications?.length || 0})
            </h3>
            <Link href="/admin/employees" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {data?.pendingApplications?.length > 0 ? (
              data.pendingApplications.map((app: any) => (
                <div key={app._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '20px', border: '1px solid #f5f5f5', background: '#fcfcfc' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white' }}>
                    {app.fullName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: '800', fontSize: '0.95rem' }}>{app.fullName}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Applied for: {app.designation || 'Field Employee'} • {app.block}, {app.district}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleStatusUpdate(app._id, 'rejected')}
                      style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid #eee', background: 'white', color: '#ef4444', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                    >Reject</button>
                    <button 
                      onClick={() => handleStatusUpdate(app._id, 'active')}
                      style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                    >Approve</button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No pending applications found.</div>
            )}
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div style={{ background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', padding: '30px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="var(--primary)" /> Top Employee Performance
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {data?.stats?.employeeStats?.map((emp: any, i: number) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#fcfcfc', borderRadius: '15px', border: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '35px', height: '35px', borderRadius: '10px', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem' }}>{i + 1}</div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800' }}>{emp._id}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>{emp.count} Members Activated</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#10b981' }}>₹{emp.total}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {/* District-wise collections */}
        <div style={{ background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', padding: '30px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '30px' }}>Collections by District</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             {data?.stats?.districtStats?.map((dist: any) => (
               <div key={dist._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '700' }}>
                    <span>{dist._id || 'Unassigned'}</span>
                    <span style={{ color: 'var(--primary)' }}>₹{dist.total}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--grad-primary)', width: `${Math.min((dist.total / (data?.stats?.totalCollections || 1)) * 100, 100)}%` }}></div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div style={{ background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', padding: '30px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '30px' }}>Recent Group/Member Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             {data?.recentGroups?.slice(0, 3).map((g: any) => (
               <div key={g._id} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)', marginTop: '5px' }}></div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{g.groupName} formed in {g.village}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>{new Date(g.createdAt).toLocaleDateString()}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
