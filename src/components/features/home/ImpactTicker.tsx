'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Star, AlertCircle } from 'lucide-react';

const updates = [
  { text: "New Women Group formed in Patna District with 25 members!", icon: MapPin, color: "#E91E63" },
  { text: "Successfully completed Health Awareness Camp in Block 4, Lucknow.", icon: Star, color: "#6A1B9A" },
  { text: "SakhiHub expands to 10 new villages in Madhya Pradesh this week.", icon: TrendingUp, color: "#4CAF50" },
  { text: "Over 5,000 Sanitary Kits distributed across rural Rajasthan.", icon: AlertCircle, color: "#FFD700" },
  { text: "New Training Center launched for skill development in Jaipur.", icon: Star, color: "#E91E63" },
];

const ImpactTicker = () => {
  return (
    <div style={{ 
      background: 'var(--secondary)', 
      color: 'white', 
      padding: '12px 0', 
      overflow: 'hidden', 
      whiteSpace: 'nowrap',
      position: 'relative',
      zIndex: 10,
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          background: 'var(--primary)', 
          padding: '0 20px', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          fontWeight: '900', 
          fontSize: '0.8rem', 
          textTransform: 'uppercase',
          letterSpacing: '1px',
          position: 'absolute',
          left: 0,
          zIndex: 2,
          boxShadow: '10px 0 20px rgba(0,0,0,0.2)'
        }}>
          Live Updates
        </div>
        
        <motion.div
          animate={{ x: [0, -1500] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ display: 'flex', paddingLeft: '150px' }}
        >
          {[...updates, ...updates].map((update, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', margin: '0 40px', fontSize: '0.9rem', fontWeight: '500' }}>
              <div style={{ color: update.color }}>
                <update.icon size={16} />
              </div>
              <span>{update.text}</span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', margin: '0 20px' }}></div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactTicker;

