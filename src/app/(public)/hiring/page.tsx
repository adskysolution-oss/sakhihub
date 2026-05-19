'use client';

import PageBanner from "@/components/ui/PageBanner";
import React, { useState } from "react";
import { Briefcase, IndianRupee, MapPin, CheckCircle, ArrowRight, Star, ShieldCheck, Heart, Zap, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function HiringPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('block');

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div style={{ background: '#fff' }}>
      <PageBanner 
        title={t('hiringPage.title')} 
        subtitle={t('hiringPage.subtitle')}
        images={[
          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500",
          "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500",
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1500"
        ]}
      />
      
      {/* Intro Stats */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('hiringPage.purpose')}</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '15px' }}>{t('hiringPage.whyWork').split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{t('hiringPage.whyWork').split(' ').slice(-1).join(' ')}</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { title: t('hiringPage.impactTitle'), desc: t('hiringPage.impactDesc'), icon: Globe },
              { title: t('hiringPage.growthTitle'), desc: t('hiringPage.growthDesc'), icon: Zap },
              { title: t('hiringPage.stabilityTitle'), desc: t('hiringPage.stabilityDesc'), icon: IndianRupee }
            ].map((item, i) => (
              <motion.div key={i} {...fadeInUp} style={{ background: '#f8f9fa', padding: '50px', borderRadius: '40px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: 'var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <item.icon size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Openings Tabs */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
             <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)' }}>{t('hiringPage.openings').split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{t('hiringPage.openings').split(' ').slice(-1).join(' ')}</span></h2>
             <p style={{ marginTop: '20px', color: '#666' }}>{t('hiringPage.openingsDesc')}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
            <div style={{ background: 'white', padding: '8px', borderRadius: '100px', display: 'flex', gap: '5px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <button 
                onClick={() => setActiveTab('block')}
                style={{ 
                  padding: '15px 40px', 
                  borderRadius: '100px', 
                  border: 'none',
                  background: activeTab === 'block' ? 'var(--grad-primary)' : 'transparent',
                  color: activeTab === 'block' ? 'white' : '#777',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                {t('hiringPage.blockEmp')}
              </button>
              <button 
                onClick={() => setActiveTab('district')}
                style={{ 
                  padding: '15px 40px', 
                  borderRadius: '100px', 
                  border: 'none',
                  background: activeTab === 'district' ? 'var(--grad-secondary)' : 'transparent',
                  color: activeTab === 'district' ? 'white' : '#777',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                {t('hiringPage.distCoord')}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ maxWidth: '1000px', margin: '0 auto' }}
            >
              <div style={{ background: 'white', borderRadius: '50px', padding: '60px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', boxShadow: '0 40px 100px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#FFF5F8', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                       <Briefcase size={24} />
                    </div>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>{t('hiringPage.femaleOnly')}</span>
                  </div>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '15px' }}>
                    {activeTab === 'block' ? t('hiringPage.blockExecTitle') : t('hiringPage.distLeadTitle')}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--primary)', marginBottom: '35px' }}>
                    <div style={{ background: 'var(--grad-primary)', padding: '10px 20px', borderRadius: '15px', color: 'white', fontWeight: '900', fontSize: '1.2rem' }}>
                       {activeTab === 'block' ? t('hiringPage.blockSalary') : t('hiringPage.distSalary')}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>{t('hiringPage.whatYouDo')}</h4>
                  <div style={{ display: 'grid', gap: '15px', marginBottom: '45px' }}>
                    {(activeTab === 'block' ? 
                      ['Going village to village to create awareness', 'Conducting workshops on period hygiene', 'Forming Self-Help Groups (SHG)', 'Submitting daily progress reports'] : 
                      ['Managing the entire district team', 'Monitoring block-level operations', 'Regular visits to 5-10 blocks', 'Reporting to higher-level management']
                    ).map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', color: '#555' }}>
                        <CheckCircle size={20} color="var(--primary)" /> {p}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '20px' }}>
                     <a href="https://forms.gle/oX8yX4UgUMmVvp8J9" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '20px 40px', borderRadius: '15px' }}>
                        {t('hiringPage.applyGoogle')} <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                     </a>
                     <Link href="/register" className="btn-secondary" style={{ padding: '20px 40px', border: '1px solid #eee', borderRadius: '15px' }}>
                        {t('hiringPage.registerSite')}
                     </Link>
                  </div>
                </div>
                
                <div style={{ background: '#f8f9fa', borderRadius: '40px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                   <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: 'var(--secondary)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                      <MapPin size={45} />
                   </div>
                   <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '15px' }}>{t('hiringPage.locationTitle')}</h3>
                   <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                      {t('hiringPage.locationDesc')}
                   </p>
                   <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #eee' }}>
                      <p style={{ margin: 0, fontWeight: '800', color: 'var(--primary)' }}>{t('hiringPage.statesTitle')}</p>
                      <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#777' }}>{t('hiringPage.statesDesc')}</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Perks Section */}
      <section className="section-padding">
        <div className="container">
           <div style={{ background: 'var(--grad-secondary)', borderRadius: '60px', padding: '80px', color: 'white', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
              <div>
                 <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '30px', lineHeight: '1.1' }}>{t('hiringPage.beyondSalary').split(' ').slice(0, -1).join(' ')} <span style={{ color: 'var(--primary)' }}>{t('hiringPage.beyondSalary').split(' ').slice(-1).join(' ')}</span></h2>
                 <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.7' }}>
                    {t('hiringPage.beyondDesc')}
                 </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                 {[
                   { t: t('hiringPage.perk1'), i: MapPin },
                   { t: t('hiringPage.perk2'), i: ShieldCheck },
                   { t: t('hiringPage.perk3'), i: Star },
                   { t: t('hiringPage.perk4'), i: Heart },
                 ].map((p, i) => (
                   <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '30px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
                      <p.i size={30} style={{ marginBottom: '15px' }} />
                      <p style={{ margin: 0, fontWeight: '800' }}>{p.t}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
