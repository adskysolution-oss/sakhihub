import React from "react";
import { Users, UserCircle, IndianRupee, Target, TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Employees', value: '42', change: '+5%', trend: 'up', icon: UserCircle, color: '#6A1B9A' },
    { label: 'Total Members', value: '2,840', change: '+12%', trend: 'up', icon: Users, color: '#E91E63' },
    { label: 'Total Revenue', value: '₹2,84,000', change: '+8%', trend: 'up', icon: IndianRupee, color: '#10b981' },
    { label: 'Campaign Reach', value: '15,000+', change: '-2%', trend: 'down', icon: Target, color: '#f59e0b' },
  ];

  return (
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
            <h4 style={{ color: 'var(--secondary)' }}>Employee Performance Ranking</h4>
            <BarChart3 size={20} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { name: 'Sunita Sharma', area: 'Varanasi', groups: 12, members: 145 },
              { name: 'Priya Verma', area: 'Lucknow', groups: 10, members: 112 },
              { name: 'Anjali Gupta', area: 'Prayagraj', groups: 8, members: 98 },
            ].map((emp, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '45px', height: '45px', background: 'var(--grad-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: '700' }}>{emp.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.area}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', color: 'var(--primary)' }}>{emp.members} Members</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.groups} Groups</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ color: 'var(--secondary)', marginBottom: '25px' }}>Campaign Distribution</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {[
              { label: 'Menstrual Health', value: '45%', color: '#E91E63' },
              { label: 'Skill Training', value: '30%', color: '#6A1B9A' },
              { label: 'Financial Literacy', value: '25%', color: '#f59e0b' },
            ].map((camp, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: '600' }}>{camp.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{camp.value}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: camp.value, height: '100%', background: camp.color }}></div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-light)', borderRadius: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Monthly Revenue Growth</p>
            <TrendingUp size={40} color="var(--primary)" style={{ marginBottom: '10px' }} />
            <h3 style={{ color: 'var(--secondary)' }}>+18.5%</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
