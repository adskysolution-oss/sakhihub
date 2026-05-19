'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Layout, Shield, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const Impact = () => {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stats = [
    { label: t('impact.womenEmpowered'), val: '50,000+', desc: t('impact.womenEmpoweredDesc'), icon: <Users size={24} /> },
    { label: t('impact.activeGroups'), val: '12,500+', desc: t('impact.activeGroupsDesc'), icon: <Layout size={24} /> },
    { label: t('impact.awarenessDrives'), val: '350+', desc: t('impact.awarenessDrivesDesc'), icon: <Target size={24} /> },
    { label: t('impact.fieldTeam'), val: '1,200+', desc: t('impact.fieldTeamDesc'), icon: <Shield size={24} /> },
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden flex items-center min-h-[500px]">
      {/* Background with Parallax effect (fixed bg) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-60 md:opacity-100"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500)' }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#2e0249]/95 via-[#2e0249]/90 to-[#e91e63]/85 backdrop-blur-[2px]"></div>

      <div className="container mx-auto px-4 relative z-[2]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              {...fadeInUp}
              whileHover={{ y: -10 }}
              className="p-8 md:p-10 bg-white rounded-[40px] text-center shadow-2xl shadow-black/20 border border-white/40 transition-all hover:shadow-primary/20"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30 -rotate-6">
                <div className="rotate-6">{stat.icon}</div>
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-secondary leading-none mb-3 tracking-tight">{stat.val}</h3>
              <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-[2px] mb-6">{stat.label}</p>
              <div className="w-10 h-1 rounded-full bg-primary/20 mx-auto mb-6"></div>
              <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed opacity-80">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
