import React from "react";
import { Users, FileUser, Heart, Package, LayoutDashboard, Settings, Image as ImageIcon, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const adminStats = [
    { label: 'Total Inquiries', value: '1,240', icon: <Users />, color: '#6C4AB6' },
    { label: 'Employee Applications', value: '85', icon: <FileUser />, color: '#FF4D8D' },
    { label: 'Delivery Leads', value: '42', icon: <Package />, color: '#10b981' },
    { label: 'Campaign Leads', value: '156', icon: <Heart />, color: '#f59e0b' },
  ];

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Overview of SakhiHub operations and leads.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-secondary" style={{ padding: '10px 20px' }}>Export Data</button>
          <div style={{ width: '45px', height: '45px', background: 'var(--secondary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>A</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
        {adminStats.map((stat, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ padding: '12px', background: `${stat.color}15`, color: stat.color, borderRadius: '12px' }}>
                {React.cloneElement(stat.icon as React.ReactElement, { size: 24 })}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>+12%</span>
            </div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '5px' }}>{stat.value}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ marginBottom: '25px' }}>Recent Website Inquiries</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Name</th>
                  <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interest</th>
                  <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '15px 10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 10px' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Priya Singh</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>80766118{i}2</p>
                    </td>
                    <td style={{ padding: '15px 10px', fontSize: '0.9rem' }}>Delivery Partner</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '5px', fontSize: '0.75rem', fontWeight: '600' }}>New</span>
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <button style={{ padding: '5px 12px', borderRadius: '5px', background: 'var(--bg-light)', color: 'var(--primary)', border: 'none', fontSize: '0.8rem', fontWeight: '600' }}>Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ marginBottom: '25px' }}>Operations Overview</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '20px', background: 'var(--bg-light)', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Active Employees</span>
                <span style={{ fontWeight: '700' }}>142</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-light)', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Campaign Reach</span>
                <span style={{ fontWeight: '700' }}>500+ Villages</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: '70%', height: '100%', background: 'var(--secondary)' }}></div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h5 style={{ marginBottom: '15px', fontSize: '0.9rem' }}>Quick Management</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.8rem' }}>Manage CMS</button>
                <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.8rem' }}>Approve Staff</button>
                <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.8rem' }}>Gallery Upload</button>
                <button className="btn-secondary" style={{ padding: '10px', fontSize: '0.8rem' }}>Reports</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
