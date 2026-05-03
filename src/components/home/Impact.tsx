'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Layout, Shield, Target, MapPin } from 'lucide-react';
import styles from './Impact.module.css';

const Impact = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      background: 'url(/images/hero_awareness_campaign.png) center/cover no-repeat fixed'
    }}>
      {/* Overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(135deg, rgba(46, 2, 73, 0.9), rgba(233, 30, 99, 0.8))',
        backdropFilter: 'blur(3px)',
        zIndex: 1
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
          {[
            { label: 'Women Empowered', val: '50,000+', desc: 'Building a strong women network across India', icon: <Users size={24} /> },
            { label: 'Active Groups', val: '12,500+', desc: 'Connecting women at village level', icon: <Layout size={24} /> },
            { label: 'Awareness Drives', val: '350+', desc: 'Health & empowerment programs running', icon: <Target size={24} /> },
            { label: 'Field Team', val: '1,200+', desc: 'Working at ground level across districts', icon: <Shield size={24} /> },
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(255, 255, 255, 0.2)' }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                padding: '40px 30px', 
                borderRadius: '24px', 
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #E91E63, #6A1B9A)', 
                color: 'white', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px'
              }}>
                {stat.icon}
              </div>
              <h3 style={{ fontSize: '40px', fontWeight: '900', color: 'var(--secondary)', lineHeight: '1', marginBottom: '10px' }}>{stat.val}</h3>
              <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>{stat.label}</p>
              <div style={{ width: '30px', height: '2px', background: 'var(--grad-primary)', margin: '0 auto 15px' }}></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
