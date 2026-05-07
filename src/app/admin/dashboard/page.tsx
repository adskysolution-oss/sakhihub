'use client';

import React from "react";
import { Users, UserCircle, IndianRupee, Target, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, ShoppingBag, Globe, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Employees', value: '142', change: '+5%', trend: 'up', icon: UserCircle, color: '#6A1B9A' },
    { label: 'Total Members', value: '52,840', change: '+12%', trend: 'up', icon: Users, color: '#E91E63' },
    { label: 'Total Vendors', value: '85', change: '+18%', trend: 'up', icon: ShoppingBag, color: '#10b981' },
    { label: 'Campaign Reach', value: '1M+', change: '+20%', trend: 'up', icon: Target, color: '#f59e0b' },
    { label: 'Total Leads', value: '458', change: '+25%', trend: 'up', icon: MessageSquare, color: '#3b82f6' },
    { label: 'Active States', value: '22', change: '0%', trend: 'neutral', icon: Globe, color: '#6366f1' },
  ];

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Admin Overview</h2>
          <p style={{ color: 'var(--text-muted)' }}>Real-time statistics of the SakhiHub movement across India.</p>
        </div>
        <button className="btn-primary" style={{ padding: '10px 25px' }}>Download Full Report</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '20px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : '#666', fontSize: '0.75rem', fontWeight: '700' }}>
                {stat.change} {stat.trend === 'up' ? <ArrowUpRight size={14} /> : stat.trend === 'down' ? <ArrowDownRight size={14} /> : null}
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{stat.label}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h4 style={{ color: 'var(--secondary)' }}>Regional Growth (State-wise)</h4>
            <select style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid #eee', fontSize: '0.8rem' }}>
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { state: 'Bihar', leads: 145, members: '12,450', growth: '+15%' },
              { state: 'Uttar Pradesh', leads: 212, members: '18,200', growth: '+12%' },
              { state: 'Rajasthan', leads: 88, members: '8,400', growth: '+8%' },
              { state: 'Madhya Pradesh', leads: 95, members: '7,100', growth: '+10%' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700' }}>{row.state}</div>
                </div>
                <div style={{ display: 'flex', gap: '40px', textAlign: 'right' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#999' }}>Leads</p>
                    <p style={{ fontWeight: '700' }}>{row.leads}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#999' }}>Members</p>
                    <p style={{ fontWeight: '700' }}>{row.members}</p>
                  </div>
                  <div style={{ color: '#10b981', fontWeight: '700' }}>{row.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '25px' }}>Inquiry Status</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {[
              { label: 'New Inquiries', value: '45%', color: '#3b82f6' },
              { label: 'In Conversation', value: '30%', color: '#f59e0b' },
              { label: 'Converted', value: '15%', color: '#10b981' },
              { label: 'Pending', value: '10%', color: '#ef4444' },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '600' }}>{item.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{item.value}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: item.value, height: '100%', background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '40px', padding: '20px', background: '#FFF5F8', borderRadius: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '10px' }}>Total Payouts This Month</p>
            <h3 style={{ color: 'var(--secondary)', fontSize: '2rem' }}>₹4,52,000</h3>
            <button className="btn-primary" style={{ marginTop: '15px', padding: '8px 20px', fontSize: '0.8rem' }}>Manage Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
}

