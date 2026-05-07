'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PageBanner.module.css';

interface PageBannerSliderProps {
  title: string;
  subtitle?: string;
  images: string[];
}

const PageBannerSlider = ({ title, subtitle, images }: PageBannerSliderProps) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className={styles.banner}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={styles.bannerImage}
          style={{ 
            backgroundImage: `linear-gradient(rgba(46, 2, 73, 0.75), rgba(108, 74, 182, 0.75)), url(${images[current]})`,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1
          }}
        />
      </AnimatePresence>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.content}>
          <motion.h1 
            key={`title-${current}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.title}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p 
              key={`sub-${current}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={styles.subtitle}
            >
              {subtitle}
            </motion.p>
          )}
          <div className={styles.breadcrumb}>
            <span>Home</span> / <span>{title}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageBannerSlider;

