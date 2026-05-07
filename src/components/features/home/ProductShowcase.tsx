'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Droplets, Heart, MessageCircle } from 'lucide-react';
import styles from './ProductShowcase.module.css';

const features = [
  { icon: <ShieldCheck size={20} />, text: 'Anti-Bacterial Layer' },
  { icon: <Zap size={20} />, text: 'Super Absorbent Core' },
  { icon: <Droplets size={20} />, text: 'Leak-Proof Design' },
  { icon: <Heart size={20} />, text: 'Skin Friendly Material' },
];

const ProductShowcase = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title">
          <span>Our Products</span>
          <h2>Sakhi Care <span className="text-gradient">Premium Pads</span></h2>
        </div>

        <div className={styles.productGrid}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.productCard}
          >
            <div className={styles.badge}>Regular Pack</div>
            <div className={styles.imageBox}>
              <img src="/images/product.png" alt="Sakhi Care Regular" />
            </div>
            <div className={styles.info}>
              <h3>Sakhi Care Regular</h3>
              <p>Ideal for daily comfort and protection.</p>
              <div className={styles.price}>₹ 40.00 <small>/ 6 Pads</small></div>
              <div className={styles.features}>
                {features.map((f, i) => (
                  <div key={i} className={styles.feature}>
                    {f.icon} <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <MessageCircle size={20} /> Inquiry Now
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`${styles.productCard} ${styles.featured}`}
          >
            <div className={styles.badge} style={{ background: 'var(--secondary)' }}>Family Pack</div>
            <div className={styles.imageBox}>
              <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800" alt="Sakhi Care Family" />
            </div>
            <div className={styles.info}>
              <h3>Sakhi Care XL Pack</h3>
              <p>Extra protection for long-lasting comfort.</p>
              <div className={styles.price}>₹ 120.00 <small>/ 18 Pads</small></div>
              <div className={styles.features}>
                {features.map((f, i) => (
                  <div key={i} className={styles.feature}>
                    {f.icon} <span>{f.text}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <MessageCircle size={20} /> Inquiry Now
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;

