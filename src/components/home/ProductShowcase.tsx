'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import styles from './ProductShowcase.module.css';

const ProductShowcase = () => {
  const features = [
    'Soft & Comfortable',
    'High Absorbency',
    'Leak Protection',
    'Skin Friendly',
    'Day & Night Use',
  ];

  return (
    <section className={styles.product}>
      <div className="container">
        <div className={styles.wrapper}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.imageBox}
          >
            <div className={styles.tag}>Best Seller</div>
            <img 
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop" 
              alt="Sakhi Care Pads" 
              className={styles.mainImg}
            />
            <div className={styles.offerBadge}>
              <span>Up to</span>
              <h4>20% OFF</h4>
            </div>
          </motion.div>

          <div className={styles.content}>
            <span className={styles.sub}>Exclusive Product</span>
            <h2>Sakhi Care Pads</h2>
            <p className={styles.desc}>
              Premium quality sanitary pads designed for comfort and hygiene. Available in Regular and Family packs for all-day protection.
            </p>

            <div className={styles.featuresList}>
              {features.map((f) => (
                <div key={f} className={styles.featureItem}>
                  <CheckCircle2 size={18} color="var(--primary)" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className={styles.packs}>
              <div className={styles.packCard}>
                <div className={styles.packHeader}>
                  <h4>Regular Pack</h4>
                  <span className={styles.padCount}>16 Pads</span>
                </div>
                <p>Day Use • Regular + XL</p>
                <div className={styles.price}>
                  <span className={styles.mrp}>₹100</span>
                  <span className={styles.offer}>₹80</span>
                </div>
              </div>

              <div className={styles.packCard}>
                <div className={styles.packHeader}>
                  <h4>Family Pack</h4>
                  <span className={styles.padCount}>24 Pads</span>
                </div>
                <p>Extra Protection • XL + XXL</p>
                <div className={styles.price}>
                  <span className={styles.mrp}>₹150</span>
                  <span className={styles.offer}>₹120</span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <a href="https://wa.me/918076611842" className="btn-secondary">
                <MessageCircle size={20} />
                WhatsApp Inquiry
              </a>
              <Link href="/products" className="btn-primary">
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
