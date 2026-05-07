'use client';

import React from 'react';
import { Target, Users, MapPin, TrendingUp, Package, MessageSquare } from 'lucide-react';

export default function VendorDashboard() {
  const stats = [
    { label: 'Assigned Districts', value: '3', icon: MapPin, color: '#6A1B9A' },
    { label: 'Total Members in Area', value: '1,240', icon: Users, color: '#E91E63' },
    { label: 'Active Campaigns', value: '12', icon: Target, color: '#f59e0b' },
    { label: 'Pending Inquiries', value: '28', icon: MessageSquare, color: '#3b82f6' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Vendor / NGO Portal</h2>
        <p style={{ color: 'var(--text-muted)' }}>Monitoring impact and operations for your assigned districts.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '50px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '25px', background: 'white' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <stat.icon size={24} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{stat.label}</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '25px' }}>Recent Activity in Your Area</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              { type: 'New Lead', details: 'Anita from Varanasi interested in Member program.', time: '2 hours ago' },
              { type: 'Campaign', details: 'Hygiene Drive at Block 4 completed successfully.', time: 'Yesterday' },
              { type: 'Stock Update', details: '1000 units of Sakhi Care Pads delivered to local hub.', time: '2 days ago' },
            ].map((act, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>{act.type}</span>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '4px' }}>{act.details}</p>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white', textAlign: 'center' }}>
          <Package size={60} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
          <h4 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Inventory Request</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '25px' }}>Need more products for your district distribution?</p>
          <button className="btn-primary" style={{ width: '100%' }}>Create New Request</button>
        </div>
      </div>
    </div>
  );
}
