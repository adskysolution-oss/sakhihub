'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Heart, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const LiveImpactMap = () => {
  const { language } = useLanguage();
  
  const activeDistricts = [
    { id: 1, name: 'Gurgaon', top: '22%', left: '38%', active: '1,200+ Women' },
    { id: 2, name: 'Jaipur', top: '28%', left: '34%', active: '850+ Women' },
    { id: 3, name: 'Lucknow', top: '26%', left: '50%', active: '2,100+ Women' },
    { id: 4, name: 'Patna', top: '30%', left: '68%', active: '1,500+ Women' },
    { id: 5, name: 'Indore', top: '48%', left: '42%', active: '950+ Women' },
    { id: 6, name: 'Nagpur', top: '55%', left: '48%', active: '600+ Women' },
    { id: 7, name: 'Hyderabad', top: '70%', left: '48%', active: '1,100+ Women' },
  ];

  return (
    <section className="section-padding" style={{ background: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>
            {language === 'hi' ? 'वास्तविक समय पदचिह्न' : 'REAL-TIME FOOTPRINT'}
          </span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px' }}>
            {language === 'hi' ? <>पूरे <span className="text-gradient">भारत</span> में हमारा प्रभाव</> : <>Our Impact Across <span className="text-gradient">India</span></>}
          </h2>
          <p style={{ color: '#666', marginTop: '20px', fontSize: '1.2rem', maxWidth: '800px', margin: '20px auto 0' }}>
            {language === 'hi' 
              ? 'साखीहब तेजी से बढ़ रहा है, देश के हर कोने से महिलाओं को जोड़ रहा है।'
              : 'SakhiHub is rapidly growing, connecting women from every corner of the country.'}
          </p>
        </div>

        <div className="map-layout">
          {/* Stats List */}
          <div className="stats-list">
            {[
              { label: language === 'hi' ? 'सक्रिय जिले' : 'Active Districts', val: '45+', icon: MapPin, color: '#E91E63' },
              { label: language === 'hi' ? 'ग्राम प्रधान' : 'Village Leaders', val: '2,500+', icon: Users, color: '#6A1B9A' },
              { label: language === 'hi' ? 'स्वास्थ्य शिविर' : 'Health Camps', val: '800+', icon: Heart, color: '#4CAF50' },
              { label: language === 'hi' ? 'प्रमाणित सदस्य' : 'Certified Members', val: '50k+', icon: ShieldCheck, color: '#FFD700' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="stat-item"
              >
                <div className="stat-icon" style={{ color: item.color }}>
                  <item.icon size={28} />
                </div>
                <div>
                  <h3 className="stat-val">{item.val}</h3>
                  <p className="stat-label">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Realistic Map Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="map-container"
          >
            {/* Proper India Map Image Background */}
            <div className="map-image-wrapper">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e0/India_map_blank.svg" 
                alt="India Map" 
                className="india-map-img"
              />
            </div>

            {/* Pulsing Markers */}
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
                <div className="pulse-marker-wrapper">
                  <motion.div
                    animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="marker-pulse"
                  />
                  <div className="marker-dot" />
                  
                  <div className="marker-tooltip">
                    {district.name}: <span style={{ color: 'var(--primary)' }}>{district.active}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="live-update-badge">
               <h4 className="badge-title">Live Updates</h4>
               <p className="badge-text">
                  📍 Bihar: New group formed with 25 members
               </p>
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          .map-layout {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 60px;
            align-items: center;
          }
          .stats-list {
            display: grid;
            gap: 25px;
          }
          .stat-item {
            padding: 30px;
            background: #fcfcfc;
            border-radius: 24px;
            display: flex;
            align-items: center;
            gap: 25px;
            border: 1px solid #f0f0f0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.02);
            transition: 0.3s;
          }
          .stat-item:hover {
            transform: translateX(10px);
            background: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          }
          .stat-icon {
            width: 65px;
            height: 65px;
            border-radius: 18px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          }
          .stat-val {
            font-size: 2.2rem;
            font-weight: 900;
            color: var(--secondary);
            margin: 0;
            line-height: 1;
          }
          .stat-label {
            color: #666;
            font-weight: 700;
            margin: 5px 0 0;
          }
          .map-container {
            position: relative;
            height: 700px;
            background: #fdfdfd;
            border-radius: 50px;
            border: 1px solid #f0f0f0;
            overflow: hidden;
            box-shadow: 0 30px 70px rgba(0,0,0,0.05);
          }
          .map-image-wrapper {
            position: absolute;
            inset: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
          }
          .india-map-img {
            max-width: 100%;
            max-height: 100%;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.05));
            opacity: 0.6;
          }
          .pulse-marker-wrapper {
            position: relative;
          }
          .marker-pulse {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 45px;
            height: 45px;
            background: var(--primary);
            border-radius: 50%;
            z-index: -1;
          }
          .marker-dot {
            width: 14px;
            height: 14px;
            background: var(--primary);
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 15px rgba(233, 30, 99, 0.6);
          }
          .marker-tooltip {
            position: absolute;
            bottom: 25px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 8px 18px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            white-space: nowrap;
            font-size: 0.85rem;
            font-weight: 800;
            color: var(--secondary);
            pointer-events: none;
            opacity: 0;
            transition: 0.3s;
          }
          .pulse-marker-wrapper:hover .marker-tooltip {
            opacity: 1;
            transform: translateX(-50%) translateY(-5px);
          }
          .live-update-badge {
            position: absolute;
            bottom: 40px;
            right: 40px;
            text-align: right;
            z-index: 10;
          }
          .badge-title {
            font-size: 1.25rem;
            font-weight: 900;
            color: var(--secondary);
            margin-bottom: 8px;
          }
          .badge-text {
            font-size: 0.9rem;
            color: #444;
            background: white;
            padding: 10px 20px;
            border-radius: 100px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #f0f0f0;
          }
          @media (max-width: 1024px) {
            .map-layout {
              grid-template-columns: 1fr;
            }
            .map-container {
              height: 600px;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default LiveImpactMap;

