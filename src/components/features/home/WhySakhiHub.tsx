'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const WhySakhiHub = () => {
  const { t } = useLanguage();

  const whyCards = [
    { 
      title: t('whySakhi.cards.reach.title'), 
      desc: t('whySakhi.cards.reach.desc'), 
      image: "/images/hero_join_movement.png",
      points: t('whySakhi.cards.reach.points') || ["Direct village outreach", "Real field engagement", "Local women connection"]
    },
    { 
      title: t('whySakhi.cards.empowerment.title'), 
      desc: t('whySakhi.cards.empowerment.desc'), 
      image: "/images/about_mission.png",
      points: t('whySakhi.cards.empowerment.points') || ["Skill development", "Leadership building", "Confidence growth"]
    },
    { 
      title: t('whySakhi.cards.impact.title'), 
      desc: t('whySakhi.cards.impact.desc'), 
      image: "/images/team_field.png",
      points: t('whySakhi.cards.impact.points') || ["50,000+ women reached", "Real success stories", "Measurable impact"]
    },
    { 
      title: t('whySakhi.cards.transparent.title'), 
      desc: t('whySakhi.cards.transparent.desc'), 
      image: "/images/hero_awareness_campaign.png",
      points: t('whySakhi.cards.transparent.points') || ["Clear reporting", "Accountability", "Direct impact tracking"]
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding bg-[#FFF7FB] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-20">
          <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm block mb-4">
            {t('whySakhi.tag')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary leading-tight">
            {t('whySakhi.title').split(' ').map((word: string, i: number, arr: string[]) => (
              <span key={i}>
                {word === 'Apart' ? <span className="text-gradient">Apart</span> : word}{' '}
              </span>
            ))}
          </h2>
          <p className="text-gray-500 mt-6 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            {t('whySakhi.desc')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {whyCards.map((card, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 flex flex-col transition-all hover:shadow-primary/5 border border-white"
            >
              <div className="relative h-56 md:h-64 overflow-hidden">
                <img src={card.image} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" alt={card.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-6 left-6">
                   <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                     <CheckCircle size={18} />
                   </div>
                </div>
              </div>
              <div className="p-8 md:p-10 flex-1 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-secondary mb-4 leading-tight">{card.title}</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 flex-1 font-medium">{card.desc}</p>
                
                <div className="mb-8 space-y-3">
                  {Array.isArray(card.points) && card.points.map((point: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] md:text-xs font-bold text-secondary uppercase tracking-wider">
                      <CheckCircle size={14} className="text-primary shrink-0" /> {point}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest text-primary transition-all hover:gap-4 cursor-pointer group">
                  {t('whySakhi.ctaText')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySakhiHub;
