import React from 'react';
import { 
  Users, 
  MapPin, 
  IndianRupee, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  ChevronRight,
  BarChart3,
  Globe,
  Settings
} from 'lucide-react';

const districtData = [
  { name: 'Varanasi', groups: 120, members: 1500, collection: 150000, growth: '+15%' },
  { name: 'Prayagraj', groups: 95, members: 1200, collection: 120000, growth: '+10%' },
  { name: 'Lucknow', groups: 150, members: 2200, collection: 220000, growth: '+18%' },
  { name: 'Mirzapur', groups: 45, members: 600, collection: 60000, growth: '+5%' },
];

export default function AdminDashboard() {
  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--secondary)' }}>SakhiHub Command Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>National Operations & Field Force Overview</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-secondary" style={{ padding: '12px 24px' }}>
            <BarChart3 size={18} /> Analytics Report
          </button>
          <button className="btn-primary" style={{ padding: '12px 24px' }}>
            <Settings size={18} /> Global Settings
          </button>
        </div>
      </div>

      {/* High Level Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
        {[
          { label: 'Total Employees', value: '450', icon: Briefcase, color: '#6C4AB6' },
          { label: 'Active Members', value: '15,240', icon: Users, color: '#FF4D8D' },
          { label: 'Total Collection', value: '₹15.2L', icon: IndianRupee, color: '#10b981' },
          { label: 'Coverage Reach', value: '12 Districts', icon: Globe, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '30px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div style={{ padding: '12px', background: `${stat.color}15`, color: stat.color, borderRadius: '12px' }}>
                <stat.icon size={24} />
              </div>
              <TrendingUp size={20} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px' }}>{stat.value}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '30px' }}>
        {/* District Data Table */}
        <div className="glass-card" style={{ padding: '35px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.4rem' }}>District Performance</h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700' }}>View All Districts</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>District</th>
                  <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Groups</th>
                  <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Members</th>
                  <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Collection</th>
                  <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Growth</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map((d, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px 10px', fontWeight: '700' }}>{d.name}</td>
                    <td style={{ padding: '15px 10px' }}>{d.groups}</td>
                    <td style={{ padding: '15px 10px' }}>{d.members}</td>
                    <td style={{ padding: '15px 10px', fontWeight: '600' }}>₹{d.collection.toLocaleString()}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <span style={{ color: '#10b981', fontWeight: '700' }}>{d.growth}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Management Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="glass-card" style={{ padding: '35px', background: 'white' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '25px' }}>Operational Modules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { name: 'Team Management', count: '450 Staff', icon: <Briefcase size={18} /> },
                { name: 'Campaign CMS', count: '12 Active', icon: <Calendar size={18} /> },
                { name: 'Gallery CMS', count: '1,200 Photos', icon: <Globe size={18} /> },
                { name: 'Member Verification', count: '85 Pending', icon: <Users size={18} /> },
              ].map((link, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '15px 20px', 
                  background: 'var(--bg-light)', 
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ color: 'var(--primary)' }}>{link.icon}</div>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>{link.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.count}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '35px', background: 'var(--grad-primary)', color: 'white' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>System Health</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '20px' }}>All servers and database connections are operational.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '100px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '95%', background: 'white', borderRadius: '5px' }}></div>
              </div>
              <div style={{ width: '10px', height: '100px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '80%', background: 'white', borderRadius: '5px' }}></div>
              </div>
              <div style={{ width: '10px', height: '100px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '90%', background: 'white', borderRadius: '5px' }}></div>
              </div>
              <span style={{ marginLeft: '10px', fontWeight: '800', fontSize: '1.5rem' }}>99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
