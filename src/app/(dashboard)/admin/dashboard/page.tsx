'use client';

import React, { useEffect, useState } from "react";
import { Users, UserCircle, IndianRupee, Target, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import axios from "axios";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading Dashboard Data...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Members', value: data?.stats.totalMembers || 0, change: '+100%', trend: 'up', icon: Users, color: '#E91E63' },
    { label: 'Active Users', value: data?.stats.activeUsers || 0, change: '+100%', trend: 'up', icon: UserCircle, color: '#6A1B9A' },
    { label: 'Pending Approvals', value: data?.stats.pendingApprovals || 0, change: 'New', trend: 'up', icon: IndianRupee, color: '#10b981' },
    { label: 'Platform Stats', value: data?.stats.totalUsers || 0, change: 'All', trend: 'up', icon: Target, color: '#f59e0b' },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: '10px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Admin Overview</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time statistics of the SakhiHub movement.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '25px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={24} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: stat.trend === 'up' ? '#10b981' : '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
                  {stat.change} {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h4 style={{ color: 'var(--secondary)' }}>Recent Registrations</h4>
              <Clock size={20} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data?.recentUsers.map((user: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ width: '45px', height: '45px', background: 'var(--grad-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: '700' }}>{user.fullName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.mobile} | {user.role}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '800', color: user.status === 'pending' ? '#f59e0b' : 'var(--primary)' }}>{user.status.toUpperCase()}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {data?.recentUsers.length === 0 && <p>No recent registrations found.</p>}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <h4 style={{ color: 'var(--secondary)', marginBottom: '25px' }}>Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Manage Users</button>
               <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Review Pending</button>
               <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', border: '1px solid #ddd' }}>Platform Settings</button>
            </div>
            
            <div style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-light)', borderRadius: '15px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>System Status</p>
              <div style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                  Healthy
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


