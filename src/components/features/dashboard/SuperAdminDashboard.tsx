'use client';

import React from 'react';
import { 
  Users, UserCheck, UserPlus, IndianRupee, 
  Map, Layout, Bell, BarChart3, 
  Clock, ShieldAlert, CheckCircle2, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const adminStats = [
  { label: "Total Employees", value: "142", icon: Users, color: "#6a1b9a", trend: "+12%" },
  { label: "Active Groups", value: "840", icon: Layout, color: "#e91e63", trend: "+5%" },
  { label: "Total Members", value: "12,450", icon: UserPlus, color: "#2e7d32", trend: "+18%" },
  { label: "Collections", value: "₹12.4L", icon: IndianRupee, color: "#ef6c00", trend: "+20%" },
];

export default function SuperAdminDashboard({ stats }: { stats?: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Overview Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {adminStats.map((stat, i) => (
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
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981', background: '#f0fdf4', padding: '4px 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUpRight size={12} /> {stat.trend}
              </span>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#666', fontWeight: '600', margin: 0 }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '5px' }}>{stat.value}</h3>
            </div>
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.03, color: stat.color }}>
              <stat.icon size={100} />
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
              <ShieldAlert size={22} color="#f59e0b" /> Pending Employee Approvals
            </h3>
            <button style={{ color: 'var(--primary)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[1, 2, 3].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '20px', border: '1px solid #f5f5f5', background: '#fcfcfc' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#777' }}>
                  {['S', 'P', 'K'][i]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '800', fontSize: '0.95rem' }}>{['Sunita Sharma', 'Priyanka Devi', 'Kavita Singh'][i]}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Applied for: District Coordinator • Lucknow</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid #eee', background: 'white', color: '#ef4444', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Reject</button>
                  <button style={{ padding: '8px 15px', borderRadius: '10px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>Approve</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Summary */}
        <div style={{ background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', padding: '30px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} color="var(--primary)" /> Collection Overview
          </h3>
          <div style={{ height: '250px', background: '#f8f9fa', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.9rem', border: '1px dashed #ddd' }}>
             Graph visualization will be here
          </div>
          <div style={{ marginTop: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ padding: '20px', background: '#FFF5F8', borderRadius: '20px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800' }}>Target Met</p>
              <h4 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '5px 0' }}>92%</h4>
            </div>
            <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '20px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#10b981', fontWeight: '800' }}>Verification</p>
              <h4 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '5px 0' }}>100%</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
