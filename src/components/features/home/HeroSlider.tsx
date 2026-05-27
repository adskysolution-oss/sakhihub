'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, Package, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';
import { useLanguage } from '@/context/LanguageContext';

const HeroSlider = () => {
  const { t } = useLanguage();

  const slides = [
    {
      id: 1,
      category: t('heroSlider.slide1Cat'),
      heading: t('heroSlider.slide1Head'),
      subheading: t('heroSlider.slide1Sub'),
      buttonText: t('heroSlider.slide1Btn'),
      buttonLink: '/register',
      image: '/images/hero_main_banner.png',
      icon: <Heart />,
      color: '#E91E63'
    },
    {
      id: 2,
      category: t('heroSlider.slide2Cat'),
      heading: t('heroSlider.slide2Head'),
      subheading: t('heroSlider.slide2Sub'),
      buttonText: t('heroSlider.slide2Btn'),
      buttonLink: '/campaign',
      image: '/images/hero_join_movement.png',
      icon: <Users />,
      color: '#6A1B9A'
    },
    {
      id: 3,
      category: t('heroSlider.slide3Cat'),
      heading: t('heroSlider.slide3Head'),
      subheading: t('heroSlider.slide3Sub'),
      buttonText: t('heroSlider.slide3Btn'),
      buttonLink: '/login',
      image: '/images/hero_awareness_campaign.png',
      icon: <Briefcase />,
      color: '#E91E63'
    },
    {
      id: 4,
      category: t('heroSlider.slide4Cat'),
      heading: t('heroSlider.slide4Head'),
      subheading: t('heroSlider.slide4Sub'),
      buttonText: t('heroSlider.slide4Btn'),
      buttonLink: '/campaign',
      image: '/images/hero_awareness_campaign.png',
      icon: <Package />,
      color: '#6A1B9A'
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[85vh] md:h-screen overflow-hidden bg-black">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 z-[2]"></div>
          
          <motion.img 
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8 }}
            src={slides[current].image} 
            alt={slides[current].heading} 
            className="absolute inset-0 w-full h-full object-cover z-[1]"
          />

          <div className="container relative z-[3] h-full flex items-center px-6 md:px-12">
            <div className="max-w-3xl mt-20 md:mt-0">
              <motion.span 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full text-white font-black text-xs md:text-sm uppercase tracking-widest shadow-xl"
                style={{ background: slides[current].color }}
              >
                {slides[current].icon}
                {slides[current].category}
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`text-4xl md:text-8xl font-black text-white mt-8 mb-6 leading-[1.1] ${slides[current].id === 1 ? 'hindi' : ''}`}
              >
                {slides[current].heading}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-lg md:text-2xl text-gray-200 opacity-90 max-w-xl leading-relaxed mb-10"
              >
                {slides[current].subheading}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 md:gap-6"
              >
                <Link href={slides[current].buttonLink} className="btn-primary py-5 px-10 text-lg shadow-2xl shadow-primary/20 justify-center">
                  {slides[current].buttonText}
                  <ArrowRight size={22} className="ml-2" />
                </Link>
                <Link href="/about" className="flex items-center justify-center py-4 px-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black hover:bg-white/20 transition-all text-lg">
                  {t('heroSlider.ourMission')}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[4] flex gap-3 p-3 rounded-full bg-black/10 backdrop-blur-sm border border-white/10">
        {slides.map((_, i) => (
          <button 
            key={i} 
            className={`w-3 h-3 md:w-12 md:h-2 rounded-full transition-all duration-500 ${current === i ? 'bg-primary md:w-20' : 'bg-white/30 hover:bg-white/50'}`}
            onClick={() => setCurrent(i)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;

