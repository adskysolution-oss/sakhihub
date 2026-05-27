'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Sparkles, Quote, ShieldCheck, Milestone, Globe, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const AboutPage = () => {
  const { t } = useLanguage();
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div style={{ background: '#fff' }}>
      {/* 1. Cinematic Narrative Hero */}
      <section style={{ 
        padding: '160px 0 100px', 
        background: 'linear-gradient(135deg, #2E0249 0%, #570A57 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Elements */}
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', opacity: 0.1, zIndex: 1 }}>
          <Image src="/assets/register-hero.png" alt="Mission" fill style={{ objectFit: 'cover' }} />
        </div>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'rgba(233, 30, 99, 0.2)', borderRadius: '50%', filter: 'blur(120px)', zIndex: 1 }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 5, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px 25px', 
              borderRadius: '100px', 
              fontSize: '0.9rem', 
              fontWeight: '700', 
              letterSpacing: '2px', 
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'inline-block',
              marginBottom: '30px'
            }}>{t('aboutPage.legacy')}</span>
            
            <h1 style={{ fontSize: '5rem', fontWeight: '900', lineHeight: '1', marginBottom: '30px', letterSpacing: '-2px' }}>
              {t('aboutPage.voiceOf')} <br />
              <span style={{ color: '#E91E63' }}>{t('aboutPage.empoweredIndia')}</span>
            </h1>
            
            <p style={{ fontSize: '1.4rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto 50px', lineHeight: '1.6', fontWeight: '500' }}>
              {t('aboutPage.heroDesc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Our Story (The Journey) */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <motion.div {...fadeInUp}>
              <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '30px', lineHeight: '1.1' }}>
                {t('aboutPage.howStarted')} <br /><span className="text-gradient">{t('aboutPage.startedGradient')}</span>
              </h2>
              <div style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '25px' }}>
                  {t('aboutPage.p1')}
                </p>
                <p style={{ marginBottom: '25px' }}>
                  {t('aboutPage.p2')}
                </p>
                <p>
                  {t('aboutPage.p3')}
                </p>
              </div>
              
              <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ padding: '25px', background: '#FFF5F8', borderRadius: '24px', borderLeft: '5px solid #E91E63' }}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#E91E63', marginBottom: '5px' }}>{t('aboutPage.year')}</h4>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)' }}>{t('aboutPage.foundation')}</p>
                </div>
                <div style={{ padding: '25px', background: '#F8F5FF', borderRadius: '24px', borderLeft: '5px solid #6A1B9A' }}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#6A1B9A', marginBottom: '5px' }}>{t('aboutPage.members')}</h4>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)' }}>{t('aboutPage.activeMembers')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ position: 'relative' }}
            >
              <div style={{ borderRadius: '40px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
                <Image src="/assets/women-group.png" alt="Our Community" width={600} height={700} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
              {/* Floating Quote Card */}
              <div style={{ 
                position: 'absolute', 
                bottom: '-30px', 
                left: '-30px', 
                background: 'white', 
                padding: '40px', 
                borderRadius: '30px', 
                maxWidth: '350px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                zIndex: 10
              }}>
                <Quote size={40} color="#E91E63" style={{ marginBottom: '20px', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--secondary)', fontStyle: 'italic', lineHeight: '1.6' }}>
                  {t('aboutPage.quote')}
                </p>
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <p style={{ fontWeight: '800', color: 'var(--primary)', margin: 0 }}>{t('aboutPage.team')}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>{t('aboutPage.founding')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Our Values (Iconic Grid) */}
      <section className="section-padding" style={{ background: '#F9FAFB' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>{t('aboutPage.corePrinciples')}</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px' }}>{t('aboutPage.valuesDrive')} <span className="text-gradient">{t('aboutPage.driveUs')}</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { title: t('aboutPage.valTrust'), desc: t('aboutPage.valTrustDesc'), icon: ShieldCheck, color: '#E91E63' },
              { title: t('aboutPage.valEmp'), desc: t('aboutPage.valEmpDesc'), icon: Sparkles, color: '#6A1B9A' },
              { title: t('aboutPage.valInc'), desc: t('aboutPage.valIncDesc'), icon: Globe, color: '#E91E63' },
              { title: t('aboutPage.valImpact'), desc: t('aboutPage.valImpactDesc'), icon: Milestone, color: '#6A1B9A' },
              { title: t('aboutPage.valSis'), desc: t('aboutPage.valSisDesc'), icon: Heart, color: '#E91E63' },
              { title: t('aboutPage.valTrans'), desc: t('aboutPage.valTransDesc'), icon: Eye, color: '#6A1B9A' }
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                style={{ 
                  background: 'white', 
                  padding: '50px 40px', 
                  borderRadius: '32px', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  textAlign: 'center'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  background: `${value.color}10`, 
                  color: value.color, 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 30px'
                }}>
                  <value.icon size={32} />
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>{value.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The Vision (Dual Content) */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '100px', alignItems: 'center' }}>
            <motion.div {...fadeInUp}>
              <div style={{ position: 'relative', height: '500px', borderRadius: '40px', overflow: 'hidden' }}>
                <Image src="/assets/field-work.png" alt="Our Vision" fill style={{ objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(46, 2, 73, 0.6), transparent)' }}></div>
              </div>
            </motion.div>

            <motion.div {...fadeInUp}>
              <div style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ width: '50px', height: '2px', background: 'var(--primary)' }}></div>
                  <span style={{ fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>{t('aboutPage.ourVision')}</span>
                </div>
                <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', lineHeight: '1.2', marginBottom: '25px' }}>
                  {t('aboutPage.createFuture')} <span className="text-gradient">{t('aboutPage.selfReliant')}</span> {t('aboutPage.futureForWoman')}
                </h3>
                <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  {t('aboutPage.visionDesc')}
                </p>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  { title: t('aboutPage.visHealth'), desc: t('aboutPage.visHealthDesc') },
                  { title: t('aboutPage.visFin'), desc: t('aboutPage.visFinDesc') },
                  { title: t('aboutPage.visDig'), desc: t('aboutPage.visDigDesc') }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '20px', padding: '25px', background: '#F9FAFB', borderRadius: '24px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '5px' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Team Section (Small & Human Centric) */}
      <section className="section-padding" style={{ background: '#FFF5F8' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>{t('aboutPage.theTeam')}</span>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px', marginBottom: '60px' }}>{t('aboutPage.humansBehind')} <span className="text-gradient">{t('aboutPage.theMovement')}</span></h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            {[1, 2, 3, 4].map((i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                <div style={{ 
                  aspectRatio: '1', 
                  borderRadius: '32px', 
                  overflow: 'hidden', 
                  marginBottom: '20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  <Image src={i % 2 === 0 ? "/assets/field-work.png" : "/assets/women-group.png"} alt="Team Member" fill style={{ objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', margin: '0 0 5px 0' }}>{t('aboutPage.fieldLeader')} {i}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>{t('aboutPage.groundOutreach')}</p>
              </motion.div>
            ))}
          </div>
          
          <p style={{ marginTop: '60px', fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '60px auto 0' }}>
            {t('aboutPage.teamDesc')}
          </p>
        </div>
      </section>

      {/* 6. Join the Mission CTA */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ 
            background: 'var(--grad-primary)', 
            borderRadius: '50px', 
            padding: '100px 60px', 
            textAlign: 'center', 
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(233, 30, 99, 0.3)'
          }}>
            <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '30px' }}>{t('aboutPage.writeChapter')} <br /> {t('aboutPage.withUs')}</h2>
            <p style={{ fontSize: '1.4rem', opacity: 0.9, marginBottom: '50px', maxWidth: '800px', margin: '0 auto 50px' }}>
              {t('aboutPage.joinDesc')}
            </p>
            <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
              <Link href="/register" className="btn-secondary" style={{ background: 'white', color: 'var(--secondary)', padding: '22px 60px', fontSize: '1.2rem', borderRadius: '100px' }}>
                {t('aboutPage.joinMission')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

