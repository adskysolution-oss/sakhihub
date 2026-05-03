'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ProgramsPreview.module.css';

const ProgramsPreview = () => {
  const { t } = useLanguage();

  const programs = [
    {
      title: 'Health & Hygiene',
      hindi: 'स्वास्थ्य और स्वच्छता',
      image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800',
      color: '#E91E63',
      href: '/programs/health'
    },
    {
      title: 'Employment',
      hindi: 'रोज़गार और अवसर',
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800',
      color: '#6A1B9A',
      href: '/programs/employment'
    },
    {
      title: 'Education',
      hindi: 'शिक्षा एवं जागरूकता',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800',
      color: '#4CAF50',
      href: '/programs/education'
    },
    {
      title: 'Community',
      hindi: 'सामुदायिक नेटवर्क',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800',
      color: '#FFD700',
      href: '/programs/community'
    },
  ];

  return (
    <section className={styles.programs}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>{t('programs')}</span>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)' }}>Our Core <span className="text-gradient">Initiatives</span></h2>
          <p style={{ fontSize: '1.1rem', color: '#666', marginTop: '10px' }}>Ground-level initiatives to drive positive change in women's lives.</p>
        </div>

        <div className={styles.grid}>
          {programs.map((program, index) => (
            <Link href={program.href} key={program.title} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
                className={styles.card}
              >
                <div className={styles.imageBox}>
                  <img src={program.image} alt={program.title} />
                  <div className={styles.overlay} style={{ background: `linear-gradient(to top, ${program.color}, transparent)` }}></div>
                </div>
                <div className={styles.cardBody}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '5px' }}>{program.hindi}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{program.title}</p>
                  <div className={styles.exploreBtn} style={{ color: program.color }}>
                    Learn More <ArrowRight size={16} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsPreview;
