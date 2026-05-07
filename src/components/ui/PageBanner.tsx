'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PageBanner.module.css';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  images?: string[]; // Support multiple images for slider
  image?: string;    // Fallback for single image
}

const PageBanner = ({ title, subtitle, images, image }: PageBannerProps) => {
  const [current, setCurrent] = useState(0);
  const slideImages = images || (image ? [image] : [
    'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1500'
  ]);

  useEffect(() => {
    if (slideImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideImages]);

  return (
    <section className={styles.banner}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className={styles.bannerImage}
          style={{ backgroundImage: `linear-gradient(rgba(46, 2, 73, 0.6), rgba(108, 74, 182, 0.4)), url(${slideImages[current]})` }}
        />
      </AnimatePresence>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={styles.content}
        >
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> / <span>{title}</span>
          </div>
        </motion.div>
      </div>

      {slideImages.length > 1 && (
        <div className={styles.indicators}>
          {slideImages.map((_, i) => (
            <div 
              key={i} 
              className={`${styles.indicator} ${i === current ? styles.active : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// Internal Link component for breadcrumb
import Link from 'next/link';

export default PageBanner;

