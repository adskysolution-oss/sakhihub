'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Heart, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const activeDistricts = [
  { id: 1, name: 'Gurgaon',   top: '22%', left: '37%', active: '1,200+ Women', state: 'Haryana' },
  { id: 2, name: 'Jaipur',    top: '29%', left: '32%', active: '850+ Women',   state: 'Rajasthan' },
  { id: 3, name: 'Lucknow',   top: '25%', left: '51%', active: '2,100+ Women', state: 'U.P.' },
  { id: 4, name: 'Patna',     top: '31%', left: '62%', active: '1,500+ Women', state: 'Bihar' },
  { id: 5, name: 'Indore',    top: '47%', left: '41%', active: '950+ Women',   state: 'M.P.' },
  { id: 6, name: 'Nagpur',    top: '56%', left: '47%', active: '600+ Women',   state: 'Maharashtra' },
  { id: 7, name: 'Hyderabad', top: '68%', left: '47%', active: '1,100+ Women', state: 'Telangana' },
];

const liveUpdates = [
  '📍 Bihar: New group formed with 25 members',
  '🌸 Lucknow: 50 health kits distributed today',
  '✅ Jaipur: Monthly camp completed — 120 women attended',
  '📦 Indore: Pad stock replenished for 3 villages',
  '💬 Gurgaon: Awareness session held for 40 women',
];

const LiveImpactMap = () => {
  const { language } = useLanguage();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex(i => (i + 1) % liveUpdates.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: language === 'hi' ? 'सक्रिय जिले'      : 'Active Districts',   val: '45+',   icon: MapPin,      color: '#E91E63' },
    { label: language === 'hi' ? 'ग्राम प्रधान'      : 'Village Leaders',    val: '2,500+', icon: Users,       color: '#6A1B9A' },
    { label: language === 'hi' ? 'स्वास्थ्य शिविर'  : 'Health Camps',       val: '800+',   icon: Heart,       color: '#4CAF50' },
    { label: language === 'hi' ? 'प्रमाणित सदस्य'   : 'Certified Members',  val: '50k+',   icon: ShieldCheck, color: '#FF9800' },
  ];

  return (
    <section style={{ background: '#fff', padding: '100px 20px', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '3px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            {language === 'hi' ? 'वास्तविक समय पदचिह्न' : 'REAL-TIME FOOTPRINT'}
          </span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px', lineHeight: 1.2 }}>
            {language === 'hi'
              ? <><span className="text-gradient">भारत</span> में हमारा प्रभाव</>
              : <>Our Impact Across <span className="text-gradient">India</span></>}
          </h2>
          <p style={{ color: '#888', marginTop: '20px', fontSize: '1.1rem', maxWidth: '700px', margin: '20px auto 0' }}>
            {language === 'hi'
              ? 'साखीहब तेजी से बढ़ रहा है, देश के हर कोने से महिलाओं को जोड़ रहा है।'
              : 'SakhiHub is rapidly growing, connecting women from every corner of the country.'}
          </p>
        </div>

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '60px', alignItems: 'center' }}>

          {/* Left: Stats */}
          <div style={{ display: 'grid', gap: '22px' }}>
            {stats.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 10 }}
                style={{
                  padding: '28px',
                  background: '#fafafa',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  transition: '0.3s',
                  cursor: 'default',
                }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: '18px',
                  background: 'white', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                  color: item.color, flexShrink: 0,
                }}>
                  <item.icon size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)', margin: 0, lineHeight: 1 }}>{item.val}</h3>
                  <p style={{ color: '#666', fontWeight: '700', margin: '6px 0 0' }}>{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: India Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              position: 'relative',
              height: '680px',
              borderRadius: '40px',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, #FFF5FA 0%, #F3E8FF 100%)',
              border: '1.5px solid #f0e6ff',
              boxShadow: '0 30px 70px rgba(107,33,168,0.08)',
            }}
          >
            {/* India SVG Map Background */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Using a reliable India map SVG */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e0/India_map_blank.svg"
                alt="India Map"
                style={{
                  width: '85%',
                  height: '85%',
                  objectFit: 'contain',
                  opacity: 0.18,
                  filter: 'hue-rotate(280deg) saturate(2) brightness(0.6)',
                }}
              />
            </div>

            {/* Decorative grid lines */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(233,30,140,0.07) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />

            {/* City Markers */}
            {activeDistricts.map((d) => (
              <div
                key={d.id}
                style={{ position: 'absolute', top: d.top, left: d.left, zIndex: 5 }}
                onMouseEnter={() => setHoveredCity(d.id)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Ripple */}
                <motion.div
                  animate={{ scale: [1, 2.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '40px', height: '40px',
                    background: 'var(--primary)', borderRadius: '50%',
                    zIndex: -1,
                  }}
                />
                {/* Dot */}
                <div style={{
                  width: '14px', height: '14px',
                  background: 'var(--primary)', borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 0 16px rgba(233,30,99,0.7)',
                  cursor: 'pointer',
                }} />
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredCity === d.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute', bottom: '24px', left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'white',
                        padding: '10px 18px', borderRadius: '14px',
                        boxShadow: '0 12px 30px rgba(107,33,168,0.15)',
                        whiteSpace: 'nowrap', fontSize: '0.85rem',
                        fontWeight: '800', color: 'var(--secondary)',
                        border: '1px solid #f0e6ff',
                        pointerEvents: 'none',
                      }}
                    >
                      <div style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '700', marginBottom: '2px' }}>
                        {d.state}
                      </div>
                      {d.name}: <span style={{ color: 'var(--primary)' }}>{d.active}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Live Update Ticker */}
            <div style={{
              position: 'absolute', bottom: '30px', left: '20px', right: '20px',
              background: 'white', borderRadius: '16px',
              padding: '16px 22px',
              boxShadow: '0 10px 35px rgba(107,33,168,0.12)',
              border: '1px solid #f0e6ff',
              zIndex: 10,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white', fontSize: '0.7rem', fontWeight: '800',
                  padding: '3px 10px', borderRadius: '100px', letterSpacing: '1px',
                }}>● LIVE</span>
                <h4 style={{ fontWeight: '900', color: 'var(--secondary)', margin: 0, fontSize: '1rem' }}>
                  Live Updates
                </h4>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  style={{ fontSize: '0.9rem', color: '#444', margin: 0, fontWeight: '600' }}
                >
                  {liveUpdates[tickerIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Top-right: Active now badge */}
            <div style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'white', borderRadius: '14px',
              padding: '10px 18px',
              boxShadow: '0 8px 24px rgba(107,33,168,0.1)',
              border: '1px solid #f0e6ff',
              zIndex: 10,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)', lineHeight: 1 }}>7</div>
              <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: '700', marginTop: '4px' }}>Active<br/>Cities</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveImpactMap;
