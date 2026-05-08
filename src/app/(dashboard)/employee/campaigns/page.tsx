import React from 'react';
import { Calendar, Target, Users, ArrowRight } from 'lucide-react';

const activeCampaigns = [
  {
    title: 'Suraksha Bandhan 2024',
    village: 'Rampur Block',
    target: '500 Women',
    joined: '320',
    status: 'In Progress',
    deadline: 'June 30, 2024'
  },
  {
    title: 'Hygiene Awareness Drive',
    village: 'Kashi Block',
    target: '1000 Women',
    joined: '850',
    status: 'Almost Done',
    deadline: 'May 20, 2024'
  },
  {
    title: 'Self-Help Group Initiative',
    village: 'Multiple Villages',
    target: '20 Groups',
    joined: '12',
    status: 'Started',
    deadline: 'Aug 15, 2024'
  }
];

export default function EmployeeCampaignsPage() {
  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Active Campaigns</h2>
        <p style={{ color: 'var(--text-muted)' }}>Track and manage your assigned campaign activities.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {activeCampaigns.map((camp, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '30px', background: 'white', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', alignItems: 'center', gap: '30px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--secondary)', marginBottom: '5px' }}>{camp.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location: {camp.village}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Progress</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(parseInt(camp.joined) / parseInt(camp.target)) * 100}%`, 
                    height: '100%', 
                    background: 'var(--primary)' 
                  }}></div>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{camp.joined}/{camp.target}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Deadline</p>
              <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{camp.deadline}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
                Track Activity <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

