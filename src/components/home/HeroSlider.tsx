'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, Package, Briefcase, Truck } from 'lucide-react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

const slides = [
  {
    id: 1,
    category: 'Women Health Campaign',
    heading: 'हर महिला स्वस्थ, हर महिला सशक्त',
    subheading: 'Join our nationwide movement for menstrual hygiene and health awareness.',
    buttonText: 'Join Campaign',
    buttonLink: '/campaign',
    image: '/images/empowerment.png',
    icon: <Heart />,
    color: '#FF4D8D'
  },
  {
    id: 2,
    category: 'Sakhi Care Pads',
    heading: 'Quality Protection for Every Woman',
    subheading: 'Premium hygiene products designed for comfort and confidence.',
    buttonText: 'Know More',
    buttonLink: '/products',
    image: '/images/product.png',
    icon: <Package />,
    color: '#6C4AB6'
  },
  {
    id: 3,
    category: 'Career Opportunities',
    heading: 'Building a Strong Women Network',
    subheading: 'Join as a Block Level Employee or District Coordinator.',
    buttonText: 'Apply Now',
    buttonLink: '/hiring',
    image: '/images/empowerment.png',
    icon: <Briefcase />,
    color: '#FF4D8D'
  },
  {
    id: 4,
    category: 'Delivery Partnership',
    heading: 'Empower Your Community',
    subheading: 'Become a delivery partner and earn while serving women in your block.',
    buttonText: 'Become Partner',
    buttonLink: '/delivery-partner',
    image: '/images/delivery.png',
    icon: <Truck />,
    color: '#6C4AB6'
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
