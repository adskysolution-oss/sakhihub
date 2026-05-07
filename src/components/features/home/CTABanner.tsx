'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const CTABanner = () => {
  const { t, language } = useLanguage();

  return (
    <section className="section-padding" style={{ paddingBottom: '0' }}>
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ 
            background: 'var(--grad-dark)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '120px 40px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
          }}
        >
          {/* Background Decor */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '400px', height: '400px', background: 'rgba(233, 30, 99, 0.25)', borderRadius: '50%', filter: 'blur(100px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '400px', height: '400px', background: 'rgba(106, 27, 154, 0.25)', borderRadius: '50%', filter: 'blur(100px)' }}></div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '4.5rem', marginBottom: '30px', fontWeight: '900', lineHeight: '1.1' }}
          >
            {language === 'hi' ? (
              <>आज ही जुड़ें और बदलाव का <span style={{ color: 'var(--primary)' }}>हिस्सा बनें</span></>
            ) : (
              <>Join Today & <span style={{ color: 'var(--primary)' }}>Be the Change</span></>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '1.4rem', opacity: 0.9, maxWidth: '850px', margin: '0 auto 50px', lineHeight: '1.6' }}
          >
            {language === 'hi' 
              ? "आज ही साखीहब से जुड़ें और अपने समुदाय को सशक्त बनाएं। आपके द्वारा उठाया गया हर कदम भारत भर में महिलाओं के जीवन पर स्थायी प्रभाव डालता है।"
              : "Join SakhiHub today and empower your community. Every step you take creates a lasting impact on women's lives across India. Join the movement now!"
            }
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/register" className="btn-primary" style={{ background: 'white', color: 'var(--secondary)', padding: '22px 50px', fontSize: '1.2rem', borderRadius: '50px' }}>
              {t('join_btn')} <ArrowRight size={24} />
            </Link>
            <Link href="https://wa.me/918076611842" target="_blank" className="btn-secondary" style={{ border: '2px solid rgba(255,255,255,0.4)', color: 'white', background: 'transparent', padding: '22px 50px', fontSize: '1.2rem', borderRadius: '50px' }}>
              <MessageCircle size={24} />
              {language === 'hi' ? 'व्हाट्सएप पूछताछ' : 'WhatsApp Inquiry'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;

