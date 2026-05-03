'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Home, ShieldCheck, HeartPulse } from 'lucide-react';
import styles from './Impact.module.css';

const stats = [
  { label: 'Women Reached', value: '10,000+', icon: <Users size={32} /> },
  { label: 'Villages Covered', value: '500+', icon: <Home size={32} /> },
  { label: 'Partners Joined', value: '50+', icon: <ShieldCheck size={32} /> },
  { label: 'Active Campaigns', value: '120+', icon: <HeartPulse size={32} /> },
];

const Impact = () => {
  return (
    <section className={styles.impact}>
      <div className="container">
        <div className={styles.header}>
          <h2 className="text-gradient">Our Growing Impact</h2>
          <p>We are dedicated to making a difference at the grassroots level.</p>
        </div>
        
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={styles.statCard}
            >
              <div className={styles.iconWrapper}>{stat.icon}</div>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
