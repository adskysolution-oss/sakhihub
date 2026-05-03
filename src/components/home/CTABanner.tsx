'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CTABanner = () => {
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
            padding: '80px 40px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Decor */}
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255, 77, 141, 0.2)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(108, 74, 182, 0.2)', borderRadius: '50%', filter: 'blur(50px)' }}></div>

          <h2 className="hindi" style={{ fontSize: '3.5rem', marginBottom: '30px', fontWeight: '800' }}>
            आज ही जुड़ें और बदलाव का हिस्सा बनें
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, maxWidth: '800px', margin: '0 auto 40px' }}>
            Join SakhiHub today and empower your community. Every step you take creates a lasting impact on women's lives across India.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ background: 'white', color: 'var(--secondary)' }}>
              Join Movement <ArrowRight size={20} />
            </Link>
            <Link href="https://wa.me/918076611842" target="_blank" className="btn-secondary" style={{ border: '2px solid rgba(255,255,255,0.3)', color: 'white', background: 'transparent' }}>
              <MessageCircle size={20} />
              WhatsApp Inquiry
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
