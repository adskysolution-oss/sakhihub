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
    <div className="bg-secondary text-white py-3 overflow-hidden whitespace-nowrap relative z-10 border-b border-white/10">
      <div className="flex items-center">
        <div className="bg-primary px-5 py-3 h-full flex items-center font-bold text-[10px] md:text-xs uppercase tracking-widest absolute left-0 z-[5] shadow-[10px_0_20px_rgba(0,0,0,0.3)]">
          Live Updates
        </div>
        
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex pl-36"
        >
          {[...updates, ...updates, ...updates].map((update, i) => (
            <div key={i} className="inline-flex items-center gap-3 mx-10 md:mx-12 text-xs md:text-sm font-medium opacity-90">
              <div style={{ color: update.color }}>
                <update.icon size={14} />
              </div>
              <span>{update.text}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 mx-8 md:mx-10 shrink-0"></div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactTicker;

