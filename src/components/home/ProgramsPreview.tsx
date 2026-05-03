'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, BookOpen, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ProgramsPreview.module.css';

const ProgramsPreview = () => {
  const { t } = useLanguage();

  const programs = [
    {
      title: 'Health & Hygiene',
      hindi: 'स्वास्थ्य और स्वच्छता',
      icon: <Heart size={32} />,
      color: '#E91E63',
      href: '/programs/health'
    },
    {
      title: 'Employment',
      hindi: 'रोज़गार और अवसर',
      icon: <Briefcase size={32} />,
      color: '#6A1B9A',
      href: '/programs/employment'
    },
    {
      title: 'Education',
      hindi: 'शिक्षा एवं जागरूकता',
      icon: <BookOpen size={32} />,
      color: '#4CAF50',
      href: '/programs/education'
    },
    {
      title: 'Community',
      hindi: 'सामुदायिक नेटवर्क',
      icon: <Users size={32} />,
      color: '#FFD700',
      href: '/programs/community'
    },
  ];

  return (
    <section className={styles.programs}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>{t('programs')}</span>
          <h2>Our Core <span className="text-gradient">Initiatives</span></h2>
          <p>Ground-level initiatives to drive positive change in women's lives.</p>
        </div>

        <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {programs.map((program, index) => (
            <Link href={program.href} key={program.title} style={{ textDecoration: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className={styles.card}
              >
                <div className={styles.iconBox} style={{ background: program.color }}>
                  {program.icon}
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{program.hindi}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{program.title}</p>
                <div className={styles.hoverContent} style={{ color: 'var(--primary)', fontWeight: '800' }}>
                  <span>Learn More →</span>
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
