import React from 'react';
import { BookOpen, Download, PlayCircle, FileText } from 'lucide-react';

const trainingItems = [
  {
    title: 'Menstrual Hygiene Guide',
    type: 'PDF Guide',
    desc: 'Complete guide on how to conduct awareness sessions in villages.',
    icon: <FileText color="#FF4D8D" />
  },
  {
    title: 'Group Management 101',
    type: 'Video Lesson',
    desc: 'Video tutorial on creating and managing women support groups.',
    icon: <PlayCircle color="#6C4AB6" />
  },
  {
    title: 'Product Knowledge',
    type: 'Presentation',
    desc: 'Technical details and benefits of Sakhi Care Pads for distributors.',
    icon: <LayoutDashboard size={20} color="#FF4D8D" />
  },
  {
    title: 'Daily Reporting Tutorial',
    type: 'Manual',
    desc: 'Step-by-step guide on how to fill daily reports correctly.',
    icon: <FileText color="#6C4AB6" />
  }
];

import { LayoutDashboard } from 'lucide-react';

export default function TrainingPage() {
  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Training Materials</h2>
        <p style={{ color: 'var(--text-muted)' }}>Learn and improve your field skills with our curated resources.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {trainingItems.map((item, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '35px', background: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '50px', height: '50px', background: 'var(--bg-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {item.icon}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>{item.type}</span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--secondary)', marginTop: '5px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '10px' }}>{item.desc}</p>
            </div>
            <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem', marginTop: 'auto' }}>
              <Download size={16} /> Access Material
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

