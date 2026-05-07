'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Users, 
  Trophy, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';

const MemberDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const stats = [
    { label: 'Impact Points', val: '0', icon: Trophy, color: '#FFD700', trend: 'New Member' },
    { label: 'Group Members', val: '0', icon: Users, color: '#E91E63', trend: 'Starting' },
    { label: 'Campaigns', val: '0', icon: CheckCircle, color: '#6A1B9A', trend: 'Upcoming' },
    { label: 'Health Meets', val: '0', icon: Calendar, color: '#4CAF50', trend: 'None yet' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading your profile...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>
            Hello, <span className="text-gradient">{user?.fullName?.split(' ')[0] || 'Member'}!</span>
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Welcome back to your SakhiHub journey. Here is what is happening today.</p>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '50px' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'white',
                padding: '25px',
                borderRadius: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                border: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ 
                  width: '45px', 
                  height: '45px', 
                  borderRadius: '12px', 
                  background: `${stat.color}15`, 
                  color: stat.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <stat.icon size={24} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4CAF50', fontSize: '0.8rem', fontWeight: '700' }}>
                  <ArrowUpRight size={14} />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)', margin: '0 0 5px 0' }}>{stat.val}</h3>
              <p style={{ color: '#999', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {/* Recent Activity */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '30px' }}>Recent Activity</h3>
            <div style={{ display: 'grid', gap: '25px' }}>
              <p style={{ color: '#999', fontSize: '0.9rem' }}>No recent activity to show.</p>
            </div>
          </div>

          {/* Quick Help / Messages */}
          <div style={{ display: 'grid', gap: '30px' }}>
             <div style={{ background: 'var(--grad-primary)', padding: '30px', borderRadius: '32px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                   <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '15px' }}>Need Help?</h3>
                   <p style={{ opacity: 0.9, fontSize: '0.9rem', marginBottom: '25px' }}>Our field team is available to support you in your movement.</p>
                   <button style={{ padding: '12px 25px', borderRadius: '12px', background: 'white', color: 'var(--primary)', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquare size={18} />
                      Chat with Team
                   </button>
                </div>
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.2 }}>
                   <MessageSquare size={120} />
                </div>
             </div>

             <div style={{ background: 'white', padding: '30px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px' }}>Profile Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '50px', height: '50px', background: user?.status === 'active' ? '#f0fdf4' : '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user?.status === 'active' ? '#16a34a' : '#ea580c', fontSize: '0.9rem', fontWeight: '900' }}>
                      {user?.status?.toUpperCase()}
                   </div>
                   <div>
                      <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)' }}>{user?.role?.toUpperCase()}</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>Joined {new Date(user?.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;

