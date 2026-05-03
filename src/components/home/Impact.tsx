'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Layout, MapPin, Target } from 'lucide-react';
import styles from './Impact.module.css';

const stats = [
  { label: 'Total Women Joined', value: '10,000+', icon: <Users size={30} />, color: '#E91E63' },
  { label: 'Total Groups Created', value: '850+', icon: <Layout size={30} />, color: '#6A1B9A' },
  { label: 'Active Campaigns', value: '12', icon: <Target size={30} />, color: '#E91E63' },
  { label: 'Active Employees', value: '42', icon: <Users size={30} />, color: '#6A1B9A' },
];

const Impact = () => {
  return (
    <section className={styles.impactSection} style={{ background: 'var(--bg-light)', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ position: 'relative' }}
          >
            <img 
              src="/images/stats_illustration.png" 
              alt="SakhiHub Impact Statistics" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-medium)' }}
            />
            {/* Decorative element */}
            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: 'var(--grad-primary)', borderRadius: '50%', zIndex: -1, opacity: 0.2 }}></div>
          </motion.div>

          <div>
            <div className="section-title" style={{ textAlign: 'left', marginBottom: '40px' }}>
              <span>Our Impact</span>
              <h2 style={{ fontSize: '3rem' }}>Making a <span className="text-gradient">Real Difference</span></h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={styles.statCard}
                  style={{ background: 'white', padding: '30px', textAlign: 'left' }}
                >
                  <div className={styles.iconBox} style={{ background: `${stat.color}15`, color: stat.color, marginBottom: '15px' }}>
                    {stat.icon}
                  </div>
                  <h3 className={styles.value} style={{ fontSize: '2rem' }}>{stat.value}</h3>
                  <p className={styles.label}>{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
