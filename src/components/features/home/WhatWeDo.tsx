'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const WhatWeDo = () => {
  const { t } = useLanguage();

  const services = [
    { 
      title: t('whatWeDo.healthTitle'), 
      desc: t('whatWeDo.healthDesc'),
      points: t('whatWeDo.healthPoints') || ["Period awareness", "Health education", "Village outreach"],
      image: "/images/Health-Awareness.jpeg",
      color: "#E91E63"
    },
    { 
      title: t('whatWeDo.hygieneTitle'), 
      desc: t('whatWeDo.hygieneDesc'),
      points: t('whatWeDo.hygienePoints') || ["Clean habits", "Sanitation awareness", "Health safety"],
      image: "/images/Hygiene-Education.jpeg",
      color: "#6A1B9A"
    },
    { 
      title: t('whatWeDo.groupsTitle'), 
      desc: t('whatWeDo.groupsDesc'),
      points: t('whatWeDo.groupsPoints') || ["Group formation", "Leadership", "Community strength"],
      image: "/images/Women-Groups.jpeg",
      color: "#FF9800"
    },
    { 
      title: t('whatWeDo.employmentTitle'), 
      desc: t('whatWeDo.employmentDesc'),
      points: t('whatWeDo.employmentPoints') || ["Field jobs", "Local earning", "Career growth"],
      image: "/images/Employment.jpeg",
      color: "#4CAF50"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="py-16 md:py-32 bg-[#fcfcfc] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-16 md:mb-24 text-center">
          <span className="text-primary font-bold uppercase tracking-[2px] text-xs md:text-sm block mb-4">
            {t('whatWeDo.tag')}
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-secondary">
            {t('whatWeDo.title').split(' ').map((word: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <span className="text-gradient">{word}</span> : word + ' '}
              </React.Fragment>
            ))}
          </h2>
          <p className="text-gray-500 mt-6 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('whatWeDo.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {services.map((item, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 flex flex-col transition-all hover:shadow-primary/5"
            >
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl mb-8 bg-white border border-gray-100">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" 
                  alt={item.title} 
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                
                <div className="absolute bottom-6 left-6">
                   <div className="px-4 py-1.5 bg-primary/90 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md border border-white/20">
                     {t('whatWeDo.coreService')}
                   </div>
                </div>
              </div>
              <div className="p-8 md:p-10 flex-1 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-secondary leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 flex-1">
                  {item.desc}
                </p>
                
                <div className="mb-8 space-y-3">
                  {Array.isArray(item.points) && item.points.map((point: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] md:text-xs font-bold text-secondary uppercase tracking-wider">
                      <CheckCircle size={14} className="shrink-0" style={{ color: item.color }} /> {point}
                    </div>
                  ))}
                </div>

                <Link href="/programs" className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all hover:gap-4" style={{ color: item.color }}>
                  {t('whatWeDo.learnMore')} <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
