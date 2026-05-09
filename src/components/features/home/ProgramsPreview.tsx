'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ProgramsPreview.module.css';

const ProgramsPreview = () => {
  const { t, language } = useLanguage();

  const programs = [
    {
      en: 'Health & Hygiene',
      hi: 'स्वास्थ्य और स्वच्छता',
      image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800',
      color: '#E91E63',
      href: '/programs/health'
    },
    {
      en: 'Employment',
      hi: 'रोज़गार और अवसर',
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800',
      color: '#6A1B9A',
      href: '/programs/employment'
    },
    {
      en: 'Education',
      hi: 'शिक्षा एवं जागरूकता',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800',
      color: '#4CAF50',
      href: '/programs/education'
    },
    {
      en: 'Community',
      hi: 'सामुदायिक नेटवर्क',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800',
      color: '#FFD700',
      href: '/programs/community'
    },
  ];

  return (
    <section className="py-16 md:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 md:mb-24 max-w-4xl mx-auto">
          <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm block mb-4">{t('programs')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight">
            {language === 'hi' ? <>हमारी मुख्य <span className="text-gradient">पहल</span></> : <>Our Core <span className="text-gradient">Initiatives</span></>}
          </h2>
          <p className="text-gray-500 text-sm md:text-lg mt-6 max-w-2xl mx-auto leading-relaxed font-medium">
            {language === 'hi' 
              ? 'महिलाओं के जीवन में सकारात्मक बदलाव लाने के लिए जमीनी स्तर की पहल।'
              : 'Ground-level initiatives to drive positive change in women\'s lives.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {programs.map((program, index) => (
            <Link href={program.href} key={program.en} className="no-underline group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-50 flex flex-col transition-all hover:shadow-primary/10 h-full"
              >
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <img src={program.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={program.en} />
                  <div className="absolute inset-0 opacity-60 md:opacity-40 transition-opacity group-hover:opacity-80" style={{ background: `linear-gradient(to top, ${program.color}, transparent)` }}></div>
                  <div className="absolute bottom-6 left-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <ArrowRight size={24} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-secondary mb-3 leading-tight">
                    {language === 'hi' ? program.hi : program.en}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
                    {language === 'hi' ? program.en : program.en}
                  </p>
                  <div className="mt-auto flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all group-hover:gap-4" style={{ color: program.color }}>
                    {language === 'hi' ? 'विवरण देखें' : 'Learn More'} <ArrowRight size={18} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsPreview;
