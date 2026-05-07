'use client';

import React from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';

const MemberDashboard = () => {
  const stats = [
    { label: 'Impact Points', val: '1,250', icon: Trophy, color: '#FFD700', trend: '+12% this month' },
    { label: 'Group Members', val: '12', icon: Users, color: '#E91E63', trend: 'Active' },
    { label: 'Campaigns', val: '5', icon: CheckCircle, color: '#6A1B9A', trend: 'Completed' },
    { label: 'Health Meets', val: '3', icon: Calendar, color: '#4CAF50', trend: 'Upcoming' },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>
            Hello, <span className="text-gradient">Sunita!</span>
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Welcome back to your SakhiHub journey. Here is what is happening today.</p>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '50px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          {/* Recent Activity */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '30px' }}>Recent Activity</h3>
            <div style={{ display: 'grid', gap: '25px' }}>
              {[
                { title: 'New Group Member', desc: 'Rekha Bai joined your village group', time: '2 hours ago', icon: Users, color: 'var(--primary)' },
                { title: 'Campaign Completed', desc: 'Sanitary awareness camp in Block 4', time: 'Yesterday', icon: CheckCircle, color: '#4CAF50' },
                { title: 'Training Milestone', desc: 'You completed the Health & Hygiene course', time: '3 days ago', icon: Trophy, color: '#FFD700' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                    <item.icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--secondary)', margin: '0 0 4px 0' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>{item.desc}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#999', fontWeight: '600' }}>{item.time}</span>
                </div>
              ))}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '20px' }}>Your Village Rank</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '50px', height: '50px', background: '#FFF5F8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.4rem', fontWeight: '900' }}>
                      #2
                   </div>
                   <div>
                      <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)' }}>Top Leader</p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>Top 5% in your district</p>
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

