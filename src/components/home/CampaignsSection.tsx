'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const campaigns = [
  {
    id: 1,
    title: 'Sanitary Awareness',
    desc: 'Providing essential menstrual hygiene education and kits to rural women.',
    progress: 75,
    joined: '1,200+',
    icon: <Shield size={30} />,
    color: '#E91E63'
  },
  {
    id: 2,
    title: 'Health Camp',
    desc: 'Free health checkups and nutritional guidance for women and children.',
    progress: 45,
    joined: '850+',
    icon: <Heart size={30} />,
    color: '#6A1B9A'
  },
  {
    id: 3,
    title: 'Membership Drive',
    desc: 'Expanding our network to empower more women with digital literacy.',
    progress: 90,
    joined: '5,000+',
    icon: <Users size={30} />,
    color: '#E91E63'
  }
];

const CampaignsSection = () => {
  return (
    <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
      <div className="container">
        <div className="section-title">
          <span>Active Initiatives</span>
          <h2>Our Running <span className="text-gradient">Campaigns</span></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {campaigns.map((camp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
              style={{ padding: '40px', background: 'white' }}
            >
              <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: `${camp.color}15`, color: camp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px' }}>
                {camp.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{camp.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.7' }}>
                {camp.desc}
              </p>

              <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', fontWeight: '700' }}>
                  <span>Progress</span>
                  <span style={{ color: camp.color }}>{camp.progress}%</span>
                </div>
                <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${camp.progress}%`, height: '100%', background: camp.color }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                   <span style={{ color: camp.color }}>{camp.joined}</span> Women Joined
                </div>
                <Link href={`/campaign/${camp.id}`} style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Join Campaign <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
