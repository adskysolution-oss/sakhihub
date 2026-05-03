'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Heart, ShieldCheck } from 'lucide-react';

const LiveImpactMap = () => {
  const activeDistricts = [
    { id: 1, name: 'Gurgaon', top: '35%', left: '42%', active: '1,200+ Women' },
    { id: 2, name: 'Jaipur', top: '42%', left: '38%', active: '850+ Women' },
    { id: 3, name: 'Lucknow', top: '38%', left: '52%', active: '2,100+ Women' },
    { id: 4, name: 'Patna', top: '40%', left: '65%', active: '1,500+ Women' },
    { id: 5, name: 'Indore', top: '55%', left: '45%', active: '950+ Women' },
  ];

  return (
    <section className="section-padding" style={{ background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>REAL-TIME FOOTPRINT</span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px' }}>Our Impact Across <span className="text-gradient">India</span></h2>
          <p style={{ color: '#666', marginTop: '20px', fontSize: '1.2rem', maxWidth: '800px', margin: '20px auto 0' }}>
            SakhiHub is rapidly growing, connecting women from every corner of the country. 
            See where the revolution is happening right now.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
          {/* Stats List */}
          <div style={{ display: 'grid', gap: '30px' }}>
            {[
              { label: 'Active Districts', val: '45+', icon: MapPin, color: '#E91E63' },
              { label: 'Village Leaders', val: '2,500+', icon: Users, color: '#6A1B9A' },
              { label: 'Health Camps', val: '800+', icon: Heart, color: '#4CAF50' },
              { label: 'Certified Members', val: '50k+', icon: ShieldCheck, color: '#FFD700' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '30px',
                  background: '#f8f9fa',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '25px',
                  border: '1px solid #eee'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '16px', 
                  background: 'white', 
                  color: item.color, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                }}>
                  <item.icon size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)', margin: 0 }}>{item.val}</h3>
                  <p style={{ color: '#666', fontWeight: '700', fontSize: '1rem', margin: 0 }}>{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual Map Placeholder / Interactive Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ 
              position: 'relative', 
              height: '650px', 
              background: '#FFF5F8', 
              borderRadius: '40px',
              border: '1px solid rgba(233, 30, 99, 0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Abstract India Outline Pattern (CSS Based) */}
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              opacity: 0.1, 
              background: 'radial-gradient(circle at 50% 50%, var(--primary) 0%, transparent 70%)' 
            }}></div>

            {/* Pulse Markers */}
            {activeDistricts.map((district) => (
              <motion.div
                key={district.id}
                style={{
                  position: 'absolute',
                  top: district.top,
                  left: district.left,
                  zIndex: 2
                }}
              >
                <div style={{ position: 'relative' }}>
                  {/* Pulse Effect */}
                  <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '40px',
                      height: '40px',
                      background: 'var(--primary)',
                      borderRadius: '50%',
                      zIndex: -1
                    }}
                  />
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 0 10px rgba(233, 30, 99, 0.5)'
                  }} />
                  
                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute',
                    top: '-45px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    padding: '8px 15px',
                    borderRadius: '8px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    whiteSpace: 'nowrap',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--secondary)',
                    pointerEvents: 'none'
                  }}>
                    {district.name}: <span style={{ color: 'var(--primary)' }}>{district.active}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Background Image Overlay */}
            <div style={{ position: 'absolute', bottom: '40px', right: '40px', textAlign: 'right', zIndex: 5 }}>
               <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '5px' }}>Live Updates</h4>
               <p style={{ fontSize: '0.85rem', color: '#666', background: 'rgba(255,255,255,0.8)', padding: '5px 12px', borderRadius: '100px', backdropFilter: 'blur(5px)' }}>
                  📍 Bihar: New group formed with 25 members
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveImpactMap;
