'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const PremiumHero = () => {
  const { t } = useLanguage();

  return (
    <section style={{ 
      padding: '120px 0 80px', 
      position: 'relative', 
      overflow: 'hidden',
      background: 'white'
    }}>
      {/* Background radial gradients for texture */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(circle at 20% 20%, #ffe0ee, transparent 35%), radial-gradient(circle at 80% 10%, #efe2ff, transparent 40%)',
        opacity: 0.6,
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'center' }}>
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{ 
              color: 'var(--primary)', 
              fontWeight: '800', 
              letterSpacing: '3px', 
              textTransform: 'uppercase',
              fontSize: '0.9rem',
              display: 'block',
              marginBottom: '15px'
            }}>{t('campaign')}</span>
            
            <h1 style={{ 
              fontSize: '4.2rem', 
              fontWeight: '900', 
              lineHeight: '1.1', 
              marginBottom: '25px', 
              color: 'var(--secondary)' 
            }}>
              {t('hero_title').split(',').map((part, i) => (
                <React.Fragment key={i}>
                  {i === 1 ? <span className="text-gradient">{part}</span> : part}
                  {i === 0 && <br />}
                </React.Fragment>
              ))}
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              color: 'var(--text-muted)', 
              lineHeight: '1.8', 
              marginBottom: '45px', 
              maxWidth: '650px' 
            }}>
              {t('hero_subtitle')}
            </p>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/register" className="btn-primary" style={{ padding: '20px 45px', fontSize: '1.1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 20px 40px rgba(233, 30, 99, 0.2)' }}>
                {t('employee_join_cta') || 'Join as Employee'} <ArrowRight size={20} />
              </Link>
              <Link href="/verify-membership" className="btn-secondary" style={{ padding: '20px 45px', fontSize: '1.1rem', borderRadius: '20px', background: 'white', color: 'var(--secondary)', border: '2px solid rgba(106, 27, 154, 0.2)' }}>
                {t('verify_btn') || 'Verify Membership'}
              </Link>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {[
                { key: 'direct_impact', icon: <CheckCircle2 size={16} /> },
                { key: 'trust_focused', icon: <CheckCircle2 size={16} /> },
                { key: 'ground_reality', icon: <CheckCircle2 size={16} /> }
              ].map((item) => (
                <div key={item.key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '0.85rem', 
                  fontWeight: '800', 
                  color: 'var(--secondary)',
                  background: 'rgba(233, 30, 99, 0.06)',
                  padding: '10px 20px',
                  borderRadius: '100px',
                  border: '1px solid rgba(233, 30, 99, 0.1)'
                }}>
                  <span style={{ color: 'var(--primary)' }}>{item.icon}</span>
                  {t(item.key)}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            <div style={{ 
              borderRadius: '40px', 
              overflow: 'hidden', 
              boxShadow: '0 40px 100px rgba(106, 27, 154, 0.15)',
              height: '600px',
              border: '8px solid white'
            }}>
              <img 
                src="/images/about_mission.png" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt="SakhiHub Women Empowerment" 
              />
            </div>

            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ 
                position: 'absolute', 
                bottom: '-30px', 
                left: '40px', 
                background: 'white', 
                padding: '25px 35px', 
                borderRadius: '24px', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)',
                zIndex: 2
              }}
            >
              <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>50,000+</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '700', marginTop: '5px' }}>{t('impact')} Status</p>
            </motion.div>

            {/* Accent Circle */}
            <div style={{ 
              position: 'absolute', 
              top: '-30px', 
              right: '-30px', 
              width: '120px', 
              height: '120px', 
              background: 'var(--grad-primary)', 
              borderRadius: '50%', 
              opacity: 0.1,
              zIndex: -1
            }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHero;

