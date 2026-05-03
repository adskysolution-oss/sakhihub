'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const services = [
  { 
    hi: "स्वास्थ्य जागरूकता", 
    en: "Health Awareness", 
    desc: {
      hi: "जागरूकता अभियानों के माध्यम से मासिक धर्म स्वच्छता और समग्र महिला स्वास्थ्य को बढ़ावा देना।",
      en: "Promoting menstrual hygiene and overall women health through awareness campaigns."
    },
    points: {
      hi: ["मासिक धर्म जागरूकता", "स्वास्थ्य शिक्षा", "ग्रामीण पहुंच"],
      en: ["Period awareness", "Health education", "Village outreach"]
    },
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800",
    color: "#E91E63"
  },
  { 
    hi: "स्वच्छता शिक्षा", 
    en: "Hygiene Education", 
    desc: {
      hi: "स्वच्छता और संक्रमण की रोकथाम के बारे में वैज्ञानिक ज्ञान प्रदान करना।",
      en: "Providing scientific knowledge about hygiene, sanitation, and infection prevention."
    },
    points: {
      hi: ["स्वच्छ आदतें", "स्वच्छता जागरूकता", "स्वास्थ्य सुरक्षा"],
      en: ["Clean habits", "Sanitation awareness", "Health safety"]
    },
    image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=800",
    color: "#6A1B9A"
  },
  { 
    hi: "महिला समूह", 
    en: "Women Groups", 
    desc: {
      hi: "सहायता, सुरक्षा और विकास के लिए मजबूत स्थानीय महिला नेटवर्क बनाना।",
      en: "Creating strong local women networks for support, safety, and growth."
    },
    points: {
      hi: ["समूह गठन", "नेतृत्व", "सामुदायिक शक्ति"],
      en: ["Group formation", "Leadership", "Community strength"]
    },
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800",
    color: "#FF9800"
  },
  { 
    hi: "रोजगार अवसर", 
    en: "Employment", 
    desc: {
      hi: "ब्लॉक और ग्राम स्तर पर महिलाओं के लिए स्थानीय रोजगार के अवसर पैदा करना।",
      en: "Generating local job opportunities for women at block and village level."
    },
    points: {
      hi: ["फील्ड नौकरियां", "स्थानीय कमाई", "करियर विकास"],
      en: ["Field jobs", "Local earning", "Career growth"]
    },
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800",
    color: "#4CAF50"
  }
];

const WhatWeDo = () => {
  const { language, t } = useLanguage();
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding" style={{ background: '#fcfcfc' }}>
      <div className="container">
        <div className="section-title" style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {language === 'hi' ? 'हमारा मुख्य कार्य' : 'OUR CORE WORK'}
          </span>
          <h2 style={{ fontSize: '3.5rem', marginTop: '10px' }}>
            {language === 'hi' ? <>कर्म के माध्यम से <span className="text-gradient">सशक्तिकरण</span></> : <>Empowering Through <span className="text-gradient">Action</span></>}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.1rem' }}>
            {language === 'hi' 
              ? 'साखीहब जागरूकता पैदा करने, समुदायों का निर्माण करने और बेहतर भविष्य के लिए महिलाओं को सशक्त बनाने के लिए जमीनी स्तर पर काम करता है।'
              : 'SakhiHub works at ground level to create awareness, build communities, and empower women for a better future.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          {services.map((item, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              style={{ 
                background: 'white', 
                borderRadius: '35px', 
                overflow: 'hidden', 
                boxShadow: '0 25px 60px rgba(0,0,0,0.06)',
                border: '1px solid #f2f2f2',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img 
                  src={item.image} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.6s' }} 
                  alt={language === 'hi' ? item.hi : item.en} 
                />
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${item.color}cc, transparent)` }}></div>
              </div>
              <div style={{ padding: '35px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '10px', color: 'var(--secondary)', fontWeight: '900' }}>
                  {language === 'hi' ? item.hi : item.en}
                </h3>
                <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
                  {language === 'hi' ? item.desc.hi : item.desc.en}
                </p>
                
                <div style={{ marginBottom: '25px', flex: 1 }}>
                  {(language === 'hi' ? item.points.hi : item.points.en).map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '700', marginBottom: '8px' }}>
                      <CheckCircle size={14} color={item.color} /> {point}
                    </div>
                  ))}
                </div>

                <Link href="/programs" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: item.color, fontWeight: '900', fontSize: '0.95rem', textDecoration: 'none' }}>
                  {language === 'hi' ? 'अधिक जानें' : 'Learn More'} <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
