'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Droplets, Heart, MessageCircle } from 'lucide-react';
import styles from './ProductShowcase.module.css';
import { useLanguage } from '@/context/LanguageContext';

const ProductShowcase = () => {
  const { t } = useLanguage();

  const features = [
    { icon: <ShieldCheck size={20} />, text: t('productShowcase.featAnti') },
    { icon: <Zap size={20} />, text: t('productShowcase.featSuper') },
    { icon: <Droplets size={20} />, text: t('productShowcase.featLeak') },
    { icon: <Heart size={20} />, text: t('productShowcase.featSkin') },
  ];
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title">
          <span>{t('productShowcase.ourProducts')}</span>
          <h2>{t('productShowcase.sakhiPremium')} <span className="text-gradient">{t('productShowcase.premiumPads')}</span></h2>
        </div>

        <div className={styles.productGrid}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.productCard}
          >
            <div className={styles.badge}>{t('productShowcase.regPack')}</div>
            <div className={styles.imageBox}>
              <img src="/images/product.png" alt="Sakhi Care Regular" />
            </div>
            <div className={styles.info}>
              <h3>{t('productShowcase.regTitle')}</h3>
              <p>{t('productShowcase.regDesc')}</p>
              <div className={styles.price}>{t('productShowcase.regPrice')} <small>{t('productShowcase.regQty')}</small></div>
              <div className={styles.features}>
                {features.map((f, i) => (
                  <div key={i} className={styles.feature}>
                    {f.icon} <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <MessageCircle size={20} /> {t('productShowcase.btnInquiry')}
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`${styles.productCard} ${styles.featured}`}
          >
            <div className={styles.badge} style={{ background: 'var(--secondary)' }}>{t('productShowcase.famPack')}</div>
            <div className={styles.imageBox}>
              <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800" alt="Sakhi Care Family" />
            </div>
            <div className={styles.info}>
              <h3>{t('productShowcase.xlTitle')}</h3>
              <p>{t('productShowcase.xlDesc')}</p>
              <div className={styles.price}>{t('productShowcase.xlPrice')} <small>{t('productShowcase.xlQty')}</small></div>
              <div className={styles.features}>
                {features.map((f, i) => (
                  <div key={i} className={styles.feature}>
                    {f.icon} <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <MessageCircle size={20} /> {t('productShowcase.btnInquiry')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;

