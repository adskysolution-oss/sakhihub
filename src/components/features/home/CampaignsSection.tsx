'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const CampaignsSection = () => {
  const { t } = useLanguage();

  const campaigns = [
    {
      id: 1,
      title: t('campaignsHome.sanTitle'),
      desc: t('campaignsHome.sanDesc'),
      progress: 75,
      joined: '1,200+',
    icon: <Shield size={30} />,
    color: '#E91E63',
    image: '/images/campaign_sanitary.png'
  },
    {
      id: 2,
      title: t('campaignsHome.healthTitle'),
      desc: t('campaignsHome.healthDesc'),
      progress: 45,
      joined: '850+',
    icon: <Heart size={30} />,
    color: '#6A1B9A',
    image: '/images/campaign_health.png'
  },
    {
      id: 3,
      title: t('campaignsHome.memTitle'),
      desc: t('campaignsHome.memDesc'),
      progress: 90,
      joined: '5,000+',
    icon: <Users size={30} />,
    color: '#E91E63',
    image: '/images/campaign_membership.png'
  }
];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
      <div className="container">
        <div className="section-title">
          <span>{t('campaignsHome.activeInit')}</span>
          <h2>{t('campaignsHome.ourRunning')} <span className="text-gradient">{t('campaignsHome.campaigns')}</span></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
          {campaigns.map((camp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
              style={{ padding: '0', background: 'white', overflow: 'hidden' }}
            >
              <div style={{ width: '100%', height: '200px', position: 'relative' }}>
                <img src={camp.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={camp.title} />
                <div style={{ position: 'absolute', top: '20px', left: '20px', width: '50px', height: '50px', borderRadius: '15px', background: 'white', color: camp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-soft)' }}>
                  {camp.icon}
                </div>
              </div>
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--secondary)' }}>{camp.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {camp.desc}
                </p>

                <Link href={`/campaign/${camp.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('campaignsHome.joinNow')}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;

