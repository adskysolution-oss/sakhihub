'use client';

import React from 'react';
import { 
  Users, UserPlus, IndianRupee, MapPin, 
  Target, TrendingUp, Calendar, ArrowRight,
  ClipboardList, Bell, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

export default function EmployeeDashboard({ user }: { user: any }) {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/employee/stats');
        if (res.data.success) setData(res.data.data.stats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: "Groups Created", value: data?.totalGroups || "0", icon: Users, color: "#6a1b9a" },
    { label: "Women Members", value: data?.totalMembers || "0", icon: UserPlus, color: "#e91e63" },
    { label: "Total Collection", value: `₹${(data?.totalCollection || 0).toLocaleString()}`, icon: IndianRupee, color: "#2e7d32" },
    { label: "Monthly Goal", value: `${data?.monthlyMembers || 0} / 200`, icon: Target, color: "#ef6c00" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Welcome Banner */}
      <div style={{ 
        background: 'var(--grad-primary)', 
        borderRadius: '30px', 
        padding: '40px', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 20px 40px rgba(233, 30, 99, 0.2)'
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px' }}>Hello, {user?.fullName}!</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>You are currently assigned to <strong style={{ color: 'white' }}>{user?.block}, {user?.district}</strong>.</p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}>ID: {user?.employeeId || 'Pending'}</span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700' }}>Role: {user?.designation}</span>
          </div>
        </div>
        <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={60} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: 'white', 
              padding: '30px', 
              borderRadius: '24px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={30} />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', color: '#666', fontWeight: '600', marginBottom: '5px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)' }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Actions & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        {/* Quick Actions */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={22} color="var(--primary)" /> Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <Link href="/employee/members" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #eee', background: '#f8f9fa', textAlign: 'left', cursor: 'pointer', transition: '0.2s' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '10px' }}><UserPlus size={24} /></div>
                <p style={{ fontWeight: '800', margin: 0, color: 'var(--secondary)' }}>Add New Member</p>
                <p style={{ fontSize: '0.75rem', color: '#777', margin: '5px 0 0' }}>Register a woman in a group</p>
              </button>
            </Link>
            <Link href="/employee/groups" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #eee', background: '#f8f9fa', textAlign: 'left', cursor: 'pointer', transition: '0.2s' }}>
                <div style={{ color: '#6a1b9a', marginBottom: '10px' }}><Users size={24} /></div>
                <p style={{ fontWeight: '800', margin: 0, color: 'var(--secondary)' }}>Create Group</p>
                <p style={{ fontSize: '0.75rem', color: '#777', margin: '5px 0 0' }}>Form a new village unit</p>
              </button>
            </Link>
            <Link href="/employee/membership" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #eee', background: '#f8f9fa', textAlign: 'left', cursor: 'pointer', transition: '0.2s' }}>
                <div style={{ color: '#2e7d32', marginBottom: '10px' }}><IndianRupee size={24} /></div>
                <p style={{ fontWeight: '800', margin: 0, color: 'var(--secondary)' }}>Membership Fee</p>
                <p style={{ fontSize: '0.75rem', color: '#777', margin: '5px 0 0' }}>Collect ₹100 from member</p>
              </button>
            </Link>
            <Link href="/employee/reports" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid #eee', background: '#f8f9fa', textAlign: 'left', cursor: 'pointer', transition: '0.2s' }}>
                <div style={{ color: '#ef6c00', marginBottom: '10px' }}><TrendingUp size={24} /></div>
                <p style={{ fontWeight: '800', margin: 0, color: 'var(--secondary)' }}>Daily Report</p>
                <p style={{ fontSize: '0.75rem', color: '#777', margin: '5px 0 0' }}>Submit today's summary</p>
              </button>
            </Link>
          </div>
        </div>

        {/* Targets & Performance */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={22} color="var(--primary)" /> Targets & Score
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '700' }}>
                <span>Monthly Members Target</span>
                <span>{data?.monthlyMembers || 0} / 200</span>
              </div>
              <div style={{ height: '10px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(((data?.monthlyMembers || 0) / 200) * 100, 100)}%`, height: '100%', background: 'var(--grad-primary)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '700' }}>
                <span>Group Creation Goal</span>
                <span>{data?.totalGroups || 0} / 15</span>
              </div>
              <div style={{ height: '10px', background: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(((data?.totalGroups || 0) / 15) * 100, 100)}%`, height: '100%', background: 'var(--grad-secondary)' }}></div>
              </div>
            </div>
            <div style={{ marginTop: '10px', padding: '20px', background: '#FFF5F8', borderRadius: '20px', border: '1px dashed var(--primary)' }}>
              <p style={{ margin: 0, fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>Efficiency Score</p>
              <h4 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)', margin: '5px 0' }}>{Math.round(((data?.monthlyMembers || 0) / 200) * 100)}%</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#777' }}>{((data?.monthlyMembers || 0) / 200) >= 0.8 ? 'You are performing exceptionally well!' : 'Keep pushing to reach your monthly targets.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
