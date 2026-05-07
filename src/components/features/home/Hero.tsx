'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Heart, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.content}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.textContent}
          >
            <span className={styles.badge}>Empowering Women Across India</span>
            <h1 className={styles.title}>
              हर महिला <span className="text-gradient">स्वस्थ</span>, <br />
              हर महिला <span className="text-gradient">सशक्त</span>
            </h1>
            <p className={styles.subtitle}>
              SakhiHub महिलाओं के स्वास्थ्य, जागरूकता, शिक्षा, रोजगार और आत्मनिर्भरता के लिए एक समर्पित प्लेटफॉर्म है।
            </p>
            
            <div className={styles.btnGroup}>
              <Link href="/campaign" className="btn-primary">
                Join Campaign
                <ArrowRight size={18} />
              </Link>
              <Link href="/hiring" className="btn-secondary">
                Apply Now
              </Link>
            </div>

            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Heart size={20} /></div>
                <span>Health First</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Users size={20} /></div>
                <span>Self-Reliant</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><ClipboardCheck size={20} /></div>
                <span>Employment</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className={styles.imageContent}
          >
            <div className={styles.imageWrapper}>
              <div className={styles.circleBg}></div>
              {/* Replace with actual high-quality image or illustration */}
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop" 
                alt="Empowered Woman" 
                className={styles.heroImage}
              />
              <div className={styles.floatingCard}>
                <div className={styles.cardIcon}><Users fill="white" size={24} /></div>
                <div>
                  <h4>10,000+</h4>
                  <p>Women Empowered</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

