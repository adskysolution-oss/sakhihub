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
    <section className={styles.impactSection}>
      <div className="container">
        <div className={styles.grid}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={styles.statCard}
            >
              <div className={styles.iconBox} style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <h3 className={styles.value}>{stat.value}</h3>
              <p className={styles.label}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
