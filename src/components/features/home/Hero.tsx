'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Heart, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './Hero.module.css';
import { useLanguage } from '@/context/LanguageContext';

const Hero = () => {
  const { t } = useLanguage();
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
            <span className={styles.badge}>{t('heroHome.badge')}</span>
            <h1 className={styles.title}>
              {t('heroHome.titleP1')} <span className="text-gradient">{t('heroHome.titleHealthy')}</span>, <br />
              {t('heroHome.titleP2')} <span className="text-gradient">{t('heroHome.titleEmpowered')}</span>
            </h1>
            <p className={styles.subtitle}>
              {t('heroHome.subtitle')}
            </p>
            
            <div className={styles.btnGroup}>
              <Link href="/campaign" className="btn-primary">
                {t('heroHome.btnCampaign')}
                <ArrowRight size={18} />
              </Link>
              <Link href="/hiring" className="btn-secondary">
                {t('heroHome.btnApply')}
              </Link>
            </div>

            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Heart size={20} /></div>
                <span>{t('heroHome.featHealth')}</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><Users size={20} /></div>
                <span>{t('heroHome.featSelf')}</span>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><ClipboardCheck size={20} /></div>
                <span>{t('heroHome.featEmp')}</span>
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
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop" 
                alt="Empowered Woman" 
                className={styles.heroImage}
              />
              <div className={styles.floatingCard}>
                <div className={styles.cardIcon}><Users fill="white" size={24} /></div>
                <div>
                  <h4>{t('heroHome.statNum')}</h4>
                  <p>{t('heroHome.statLabel')}</p>
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
