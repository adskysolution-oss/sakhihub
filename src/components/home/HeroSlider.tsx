'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, Package, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

const slides = [
  {
    id: 1,
    category: 'Awareness Mission',
    heading: 'SakhiHub Awareness Mission',
    subheading: 'Join our nationwide movement for menstrual hygiene and health awareness.',
    buttonText: 'Join Now',
    buttonLink: '/register',
    image: '/images/hero_main_banner.png',
    icon: <Heart />,
    color: '#E91E63'
  },
  {
    id: 2,
    category: 'Empowerment',
    heading: 'Join Women Empowerment Movement',
    subheading: 'Building a network of strong, independent, and confident women across India.',
    buttonText: 'Start Campaign',
    buttonLink: '/campaign',
    image: '/images/hero_join_movement.png',
    icon: <Users />,
    color: '#6A1B9A'
  },
  {
    id: 3,
    category: 'Opportunities',
    heading: 'Earn + Learn + Support Women',
    subheading: 'Become a part of our community and help create sustainable employment for women.',
    buttonText: 'Employee Login',
    buttonLink: '/login',
    image: '/images/hero_awareness_campaign.png',
    icon: <Briefcase />,
    color: '#E91E63'
  },
  {
    id: 4,
    category: 'Health Awareness',
    heading: 'Health & Awareness Campaigns',
    subheading: 'Specialized camps and educational drives in rural areas for better health.',
    buttonText: 'View Campaigns',
    buttonLink: '/campaign',
    image: '/images/hero_awareness_campaign.png',
    icon: <Package />,
    color: '#6A1B9A'
  }
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.slider}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={styles.slide}
        >
          <div className={styles.imageOverlay}></div>
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6 }}
            src={slides[current].image} 
            alt={slides[current].heading} 
            className={styles.bgImage}
          />

          <div className="container">
            <div className={styles.content}>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={styles.category}
                style={{ background: slides[current].color }}
              >
                {slides[current].icon}
                {slides[current].category}
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={slides[current].id === 1 ? 'hindi' : ''}
              >
                {slides[current].heading}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {slides[current].subheading}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className={styles.btnGroup}
              >
                <Link href={slides[current].buttonLink} className="btn-primary">
                  {slides[current].buttonText}
                  <ArrowRight size={20} />
                </Link>
                <Link href="/about" className={styles.secondaryBtn}>
                  Our Mission
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button 
            key={i} 
            className={`${styles.dot} ${current === i ? styles.active : ''}`}
            onClick={() => setCurrent(i)}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
