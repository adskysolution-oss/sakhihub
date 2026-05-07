'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap, BookOpen, Briefcase, Brain, CheckCircle, ArrowRight, Users, Target, Layout, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PageBanner from "@/components/ui/PageBanner";
import { useLanguage } from '@/context/LanguageContext';

const programsData = [
  {
    slug: "health",
    title: { en: "Health & Hygiene Awareness", hi: "स्वास्थ्य और स्वच्छता जागरूकता" },
    icon: <Heart size={28} />,
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200",
    desc: {
      en: "Dedicated to promoting wellness and menstrual dignity for every woman in rural India through awareness and eco-friendly products.",
      hi: "जागरूकता और पर्यावरण के अनुकूल उत्पादों के माध्यम से ग्रामीण भारत में हर महिला के लिए कल्याण और मासिक धर्म गरिमा को बढ़ावा देने के लिए समर्पित।"
    },
    points: {
      en: ["Period Hygiene Education", "Safe Disposal Methods", "Free Sanitary Kits"],
      hi: ["मासिक धर्म स्वच्छता शिक्षा", "सुरक्षित निपटान के तरीके", "मुफ्त सैनिटरी किट"]
    },
    color: "#E91E63"
  },
  {
    slug: "employment",
    title: { en: "Employment & Self-Reliance", hi: "रोजगार एवं आत्मनिर्भरता" },
    icon: <Briefcase size={28} />,
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200",
    desc: {
      en: "Empowering women to build sustainable careers and achieve financial independence through field work and team leadership roles.",
      hi: "फील्ड वर्क और टीम लीडरशिप भूमिकाओं के माध्यम से महिलाओं को स्थायी करियर बनाने और वित्तीय स्वतंत्रता हासिल करने के लिए सशक्त बनाना।"
    },
    points: {
      en: ["Job Opportunities", "Small Business Support", "Financial Inclusion"],
      hi: ["नौकरी के अवसर", "छोटे व्यवसाय सहायता", "वित्तीय समावेशन"]
    },
    color: "#6A1B9A"
  },
  {
    slug: "education",
    title: { en: "Education & Skill Development", hi: "शिक्षा एवं कौशल विकास" },
    icon: <BookOpen size={28} />,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200",
    desc: {
      en: "Knowledge is the strongest tool for empowerment. We bridge the gap between information and action via digital literacy.",
      hi: "सशक्तिकरण के लिए ज्ञान सबसे मजबूत उपकरण है। हम डिजिटल साक्षरता के माध्यम से सूचना और कार्रवाई के बीच की खाई को पाटते हैं।"
    },
    points: {
      en: ["Technical Training", "Digital Literacy", "Vocational Skills"],
      hi: ["तकनीकी प्रशिक्षण", "डिजिटल साक्षरता", "व्यावसायिक कौशल"]
    },
    color: "#4CAF50"
  },
  {
    slug: "community",
    title: { en: "Community Network", hi: "सामुदायिक नेटवर्क" },
    icon: <Users size={28} />,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200",
    desc: {
      en: "Building a powerful sisterhood where every woman supports another through local village groups and support networks.",
      hi: "एक शक्तिशाली बहनचारे का निर्माण करना जहाँ हर महिला स्थानीय ग्रामीण समूहों और सहायता नेटवर्क के माध्यम से दूसरी महिला का समर्थन करती है।"
    },
    points: {
      en: ["Leadership Training", "Rights Awareness", "Collective Voice"],
      hi: ["नेतृत्व प्रशिक्षण", "अधिकार जागरूकता", "सामूहिक आवाज"]
    },
    color: "#FF9800"
  }
];

export default function ProgramsPage() {
  const { language, t } = useLanguage();
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <div style={{ background: '#fff' }}>
      <PageBanner 
        title={t('programs')} 
        subtitle={language === 'hi' ? "जमीनी स्तर पर राष्ट्रीय परिवर्तन लाने वाली पहल।" : "Cinematic initiatives driving national transformation at the grassroots level."}
        images={[
          "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500",
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1500",
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1500"
        ]}
      />

      {/* Intro Stats */}
      <section style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{ 
            background: 'white', 
            borderRadius: '40px', 
            padding: '45px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            boxShadow: '0 30px 70px rgba(0,0,0,0.1)',
            border: '1px solid #f2f2f2'
          }}>
            {[
              { val: "50k+", label: language === 'hi' ? "महिलाएं सशक्त" : "Women Empowered" },
              { val: "22+", label: language === 'hi' ? "राज्यों में प्रभाव" : "States Impacted" },
              { val: "1.2k+", label: language === 'hi' ? "फील्ड एजेंट" : "Field Agents" },
              { val: "500+", label: language === 'hi' ? "ग्राम समूह" : "Village Groups" }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px' }}>
                <h3 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '5px' }}>{s.val}</h3>
                <p style={{ fontSize: '0.9rem', color: '#999', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Programs Flow */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '100px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
              {language === 'hi' ? 'लाखों का सशक्तिकरण' : 'Empowering Millions'}
            </span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '10px' }}>
               {language === 'hi' ? <>हमारे <span className="text-gradient">विजन</span> को जानें</> : <>Exploring Our <span className="text-gradient">Vision</span></>}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '150px' }}>
            {programsData.map((prog, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '80px', 
                  alignItems: 'center' 
                }}
              >
                {idx % 2 !== 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      borderRadius: '50px', 
                      overflow: 'hidden', 
                      height: '500px',
                      boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
                    }}>
                      <img src={prog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={prog.title.en} />
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    background: '#FFF5F8', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '30px',
                    boxShadow: '0 10px 20px rgba(233, 30, 99, 0.1)'
                  }}>
                    {prog.icon}
                  </div>
                  <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px', lineHeight: '1.1' }}>
                    {language === 'hi' ? prog.title.hi : prog.title.en}
                  </h2>
                  <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '35px' }}>
                    {language === 'hi' ? prog.desc.hi : prog.desc.en}
                  </p>
                  
                  <div style={{ display: 'grid', gap: '18px', marginBottom: '45px' }}>
                    {(language === 'hi' ? prog.points.hi : prog.points.en).map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '700', color: 'var(--secondary)', fontSize: '1.05rem' }}>
                        <CheckCircle size={22} color="var(--primary)" /> {p}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <Link href={`/programs/${prog.slug}`} className="btn-primary" style={{ padding: '20px 45px', fontSize: '1.1rem', borderRadius: '18px' }}>
                      {language === 'hi' ? 'विवरण' : 'Details'} <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                    </Link>
                    <Link href="/register" className="btn-secondary" style={{ padding: '20px 45px', fontSize: '1.1rem', border: '1px solid #ddd', borderRadius: '18px' }}>
                      {t('join_btn')}
                    </Link>
                  </div>
                </div>

                {idx % 2 === 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      borderRadius: '50px', 
                      overflow: 'hidden', 
                      height: '500px',
                      boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
                    }}>
                      <img src={prog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={prog.title.en} />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '30px' }}>
            {language === 'hi' ? <>बदलाव का <span style={{ color: 'var(--primary)' }}>हिस्सा बनें</span></> : <>Ready to Lead the <span style={{ color: 'var(--primary)' }}>Change?</span></>}
          </h2>
          <p style={{ fontSize: '1.4rem', opacity: 0.8, maxWidth: '850px', margin: '0 auto 50px' }}>
            {language === 'hi' 
              ? 'फील्ड हीरो या टीम लीड के रूप में हमारे मिशन में शामिल हों और भारत के हर गांव तक पहुंचने में हमारी मदद करें।'
              : 'Join our mission as a Field Hero or Team Lead and help us reach every village in India.'}
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '22px 65px', fontSize: '1.3rem', borderRadius: '120px' }}>
               {language === 'hi' ? 'अपनी यात्रा शुरू करें' : 'Start Your Journey'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

