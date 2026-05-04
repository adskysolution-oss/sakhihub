import React from "react";
import { Users, UserPlus, IndianRupee, Target, TrendingUp, Calendar, FileText } from "lucide-react";

export default function EmployeeDashboard() {
  const stats = [
    { label: 'Total Groups', value: '12', icon: Users, color: '#6C4AB6' },
    { label: 'Total Members', value: '145', icon: UserPlus, color: '#FF4D8D' },
    { label: 'Today\'s Members', value: '8', icon: TrendingUp, color: '#10b981' },
    { label: 'Collection', value: '₹14,500', icon: IndianRupee, color: '#f59e0b' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Welcome, Sunita!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Here is your performance overview for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', background: 'white' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h4 style={{ color: 'var(--secondary)' }}>Recent Groups Created</h4>
            <button style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', background: 'none' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Sakhi Group {i}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Village: Rampur • 15 Members</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 hours ago</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '25px' }}>My Assigned Area</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ padding: '10px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><Target size={20} /></div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>District</p>
                <p style={{ fontWeight: '600' }}>Varanasi</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ padding: '10px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><Calendar size={20} /></div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Block</p>
                <p style={{ fontWeight: '600' }}>Kashi Vidyapeeth</p>
              </div>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
            <div style={{ padding: '20px', background: 'var(--bg-light)', borderRadius: '15px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>Monthly Target Score</p>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
              <p style={{ fontWeight: '700', color: 'var(--secondary)' }}>65% Completed</p>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-card" style={{ marginTop: '30px', padding: '25px', background: 'linear-gradient(135deg, #FFE4EC 0%, #FFFFFF 100%)', border: '1px solid #E91E8C30', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '50px', height: '50px', background: '#E91E8C', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <FileText size={24} />
          </div>
          <div>
            <h4 style={{ color: '#6B21A8', margin: 0 }}>Campaign Awareness Presentation</h4>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>Professional PPT/PDF for women's health awareness.</p>
          </div>
        </div>
        <a 
          href="/campaign/presentation" 
          style={{ 
            background: '#E91E8C', 
            color: 'white', 
            padding: '10px 25px', 
            borderRadius: '10px', 
            textDecoration: 'none', 
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 4px 15px rgba(233, 30, 140, 0.3)'
          }}
        >
          Open Presentation
        </a>
      </div>
    </div>
  );
}
