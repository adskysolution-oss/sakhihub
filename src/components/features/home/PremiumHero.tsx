'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';

const PremiumHero = () => {
  const { t } = useLanguage();
  const [impact, setImpact] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/public/stats');
        if (res.data.success) setImpact(res.data.data.totalImpact);
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-12 md:pt-32 md:pb-20">
      {/* Background radial gradients for texture */}
      <div className="absolute inset-0 opacity-60 z-0 bg-[radial-gradient(circle_at_20%_20%,#ffe0ee,transparent_35%),radial-gradient(circle_at_80%_10%,#efe2ff,transparent_40%)]" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 md:gap-16 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <span className="text-primary font-bold tracking-[2px] uppercase text-xs md:text-sm block mb-4">
              {t('campaign')}
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-secondary tracking-tight">
              {t('hero_title').split(',').map((part: string, i: number) => (
                <React.Fragment key={i}>
                  {i === 1 ? <span className="text-gradient">{part}</span> : part}
                  {i === 0 && <br className="hidden md:block" />}
                </React.Fragment>
              ))}
            </h1>

            <p className="text-base md:text-xl text-text-muted leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" className="btn-primary py-4 px-10 text-base md:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/20 no-underline">
                {t('hero.joinBtn')} <ArrowRight size={20} />
              </Link>
              <Link href="/campaign" className="btn-secondary py-4 px-10 text-base md:text-lg rounded-2xl bg-white text-secondary border-2 border-secondary/10 flex items-center justify-center no-underline">
                {t('hero.exploreBtn')}
              </Link>
            </div>

            {/* <div className="mt-12 flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { key: 'direct_impact', icon: <CheckCircle2 size={14} /> },
                { key: 'trust_focused', icon: <CheckCircle2 size={14} /> },
                { key: 'ground_reality', icon: <CheckCircle2 size={14} /> }
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-secondary bg-primary/5 px-4 py-2.5 rounded-full border border-primary/10 shadow-sm">
                  <span className="text-primary">{item.icon}</span>
                  {t(item.key)}
                </div>
              ))}
            </div> */}
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-xl mx-auto lg:max-w-none"
          >
            <div className="rounded-[40px] overflow-hidden shadow-2xl shadow-secondary/15 h-[350px] sm:h-[450px] md:h-[600px] border-4 md:border-8 border-white relative z-10">
              <img
                src="/images/about_mission.png"
                className="w-full h-full object-cover"
                alt="SakhiHub Women Empowerment"
              />
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 left-6 md:bottom-10 md:-left-10 bg-white p-6 md:p-10 rounded-[32px] shadow-2xl border border-black/5 z-20 text-center md:text-left min-w-[180px]"
            >
              <h3 className="text-3xl md:text-5xl font-bold text-primary leading-none mb-2">
                {impact ? `${impact.toLocaleString()}+` : '...'}
              </h3>
              <p className="text-[10px] md:text-xs text-secondary font-bold uppercase tracking-widest">{t('impact')} Status</p>
            </motion.div>

            {/* Accent Decor */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl z-0" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHero;

