'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './JoinMovement.module.css';
import PosterGenerator from '@/components/ui/PosterGenerator';
import { useLanguage } from '@/context/LanguageContext';

const JoinMovement = () => {
  const { t } = useLanguage();

  const joinOptions = [
    {
      title: t('joinMovement.campTitle'),
      desc: t('joinMovement.campDesc'),
      link: '/campaign',
      icon: <Users size={32} />,
      color: 'var(--primary)'
    },
    {
      title: t('joinMovement.empTitle'),
      desc: t('joinMovement.empDesc'),
      link: '/hiring',
      icon: <Briefcase size={32} />,
      color: 'var(--secondary)'
    },
    {
      title: t('joinMovement.delTitle'),
      desc: t('joinMovement.delDesc'),
      link: '/delivery-partner',
      icon: <Truck size={32} />,
      color: 'var(--primary)'
    }
  ];
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title">
          <span>{t('joinMovement.title')}</span>
          <h2>{t('joinMovement.beThe')} <span className="text-gradient">{t('joinMovement.change')}</span></h2>
        </div>

        <div className={styles.grid}>
          {joinOptions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={styles.card}
              style={{ '--accent-color': item.color } as any}
            >
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <Link href={item.link} className={styles.link}>
                {t('joinMovement.getStarted')} <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '100px' }}>
          <PosterGenerator />
        </div>
      </div>
    </section>
  );
};

export default JoinMovement;
