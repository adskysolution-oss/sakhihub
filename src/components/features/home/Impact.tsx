'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Layout, Shield, Target, MapPin } from 'lucide-react';

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
      background: 'url(https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500) center/cover no-repeat fixed'
    }}>
      {/* Overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(135deg, rgba(46, 2, 73, 0.92), rgba(233, 30, 99, 0.85))',
        backdropFilter: 'blur(5px)',
        zIndex: 1
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div className="stats-grid">
          {[
            { label: 'Women Empowered', val: '50,000+', desc: 'Building a strong women network across India', icon: <Users size={24} /> },
            { label: 'Active Groups', val: '12,500+', desc: 'Connecting women at village level', icon: <Layout size={24} /> },
            { label: 'Awareness Drives', val: '350+', desc: 'Health & empowerment programs running', icon: <Target size={24} /> },
            { label: 'Field Team', val: '1,200+', desc: 'Working at ground level across districts', icon: <Shield size={24} /> },
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              className="stat-card"
              style={{ 
                background: 'rgba(255, 255, 255, 0.98)', 
                padding: '40px 25px', 
                borderRadius: '30px', 
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'linear-gradient(135deg, #E91E63, #6A1B9A)', 
                color: 'white', 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 25px',
                transform: 'rotate(-5deg)'
              }}>
                <div style={{ transform: 'rotate(5deg)' }}>{stat.icon}</div>
              </div>
              <h3 style={{ fontSize: '36px', fontWeight: '900', color: '#2E0249', lineHeight: '1', marginBottom: '12px' }}>{stat.val}</h3>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#E91E63', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
              <div style={{ width: '40px', height: '3px', background: '#E91E63', margin: '0 auto 20px', borderRadius: '10px' }}></div>
              <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <style jsx>{`
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
            width: 100%;
          }
          @media (max-width: 1024px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 640px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default Impact;

