'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Layout, MapPin, Target } from 'lucide-react';
import styles from './Impact.module.css';

const stats = [
  { label: 'Women Joined', value: '50,000+', icon: <Users size={24} />, color: '#E91E63' },
  { label: 'Groups Created', value: '12,500+', icon: <Layout size={24} />, color: '#6A1B9A' },
  { label: 'Active Campaigns', value: '350+', icon: <Target size={24} />, color: '#E91E63' },
  { label: 'Active Employees', value: '1,200+', icon: <Users size={24} />, color: '#6A1B9A' },
];

const Impact = () => {
  return (
    <section className={styles.impactSection} style={{ padding: '40px 0', background: 'white' }}>
      <div className="container">
        <div className="glass-card" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          padding: '40px',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: `${stat.color}15`, 
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifySelf: 'center',
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)', lineHeight: '1' }}>{stat.value}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
