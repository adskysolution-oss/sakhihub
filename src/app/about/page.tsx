'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Heart, Sparkles, Quote, ShieldCheck, Milestone, Globe, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AboutPage = () => {
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
            }}>Our Legacy & Future</span>
            
            <h1 style={{ fontSize: '5rem', fontWeight: '900', lineHeight: '1', marginBottom: '30px', letterSpacing: '-2px' }}>
              We are the Voice of <br />
              <span style={{ color: '#E91E63' }}>Empowered India</span>
            </h1>
            
            <p style={{ fontSize: '1.4rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto 50px', lineHeight: '1.6', fontWeight: '500' }}>
              SakhiHub is not just an organization; it is a revolution born from the grassroots, 
              dedicated to bringing dignity, health, and independence to every woman.
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
                How it all <br /><span className="text-gradient">Started</span>
              </h2>
              <div style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '25px' }}>
                  The journey of SakhiHub began in small village meetings, where we noticed a profound gap between available resources and the women who needed them most. Health, hygiene, and financial stability were often treated as luxuries rather than rights.
                </p>
                <p style={{ marginBottom: '25px' }}>
                  We realized that true empowerment doesn&apos;t come from outside; it comes from within the community. We started by building groups of local women who could support each other, share knowledge, and grow together.
                </p>
                <p>
                  Today, SakhiHub has grown into a powerful network of over 50,000 women, driven by the same spirit of sisterhood and collective progress that sparked our first meeting.
                </p>
              </div>
              
              <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ padding: '25px', background: '#FFF5F8', borderRadius: '24px', borderLeft: '5px solid #E91E63' }}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#E91E63', marginBottom: '5px' }}>2021</h4>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)' }}>Foundation Laid</p>
                </div>
                <div style={{ padding: '25px', background: '#F8F5FF', borderRadius: '24px', borderLeft: '5px solid #6A1B9A' }}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#6A1B9A', marginBottom: '5px' }}>50k+</h4>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)' }}>Active Members</p>
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
                  &quot;Empowerment is not just about giving a woman a tool; it&apos;s about reminding her she has the power to use it.&quot;
                </p>
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <p style={{ fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Team SakhiHub</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: 0 }}>Founding Members</p>
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
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>CORE PRINCIPLES</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px' }}>Values that <span className="text-gradient">Drive Us</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { title: 'Trust', desc: 'Building long-term relationships with every village community.', icon: ShieldCheck, color: '#E91E63' },
              { title: 'Empowerment', desc: 'Focusing on skill-building and long-term independence.', icon: Sparkles, color: '#6A1B9A' },
              { title: 'Inclusion', desc: 'Leaving no woman behind, regardless of her background.', icon: Globe, color: '#E91E63' },
              { title: 'Impact', desc: 'Measuring success through real lives changed, not just numbers.', icon: Milestone, color: '#6A1B9A' },
              { title: 'Sisterhood', desc: 'Creating a safe space where women support women.', icon: Heart, color: '#E91E63' },
              { title: 'Transparency', desc: 'Full accountability in every program and campaign.', icon: Eye, color: '#6A1B9A' }
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
                  <span style={{ fontWeight: '800', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>Our Vision</span>
                </div>
                <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', lineHeight: '1.2', marginBottom: '25px' }}>
                  Creating a <span className="text-gradient">Self-Reliant</span> Future for Every Woman
                </h3>
                <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  We envision an India where every woman has the resources to look after her health, the education to make her own choices, and the career to stand on her own feet. Our roadmap involves expanding to 100+ districts by 2026, reaching over 1 million women.
                </p>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  { title: 'Universal Health Awareness', desc: 'No woman should suffer due to lack of hygiene knowledge.' },
                  { title: 'Financial Autonomy', desc: 'Every SakhiHub member should have a sustainable source of income.' },
                  { title: 'Digital Literacy', desc: 'Connecting rural women with modern digital tools and opportunities.' }
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

      {/* 5. Real Impact Stories */}
      <section className="section-padding" style={{ background: '#FFF5F8' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>REAL VOICES</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px' }}>Stories of <span className="text-gradient">Impact</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            {[
              { 
                name: "Anita Devi", 
                location: "Bihar", 
                story: "Before SakhiHub, I had no source of income. Today, as a Field Hero, I lead a team of 15 women and help provide hygiene kits to my village.",
                img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=1000"
              },
              { 
                name: "Sunita Verma", 
                location: "Uttar Pradesh", 
                story: "The education programs gave me the confidence to start my own small shop. SakhiHub didn't just give me resources; they gave me a voice.",
                img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000"
              },
              { 
                name: "Meena Kumari", 
                location: "Rajasthan", 
                story: "Learning about menstrual hygiene changed my life. Now I educate school girls and ensure they don't miss school due to lack of awareness.",
                img: "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1000"
              }
            ].map((story, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                style={{ background: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
              >
                <div style={{ height: '250px', position: 'relative' }}>
                  <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'white', padding: '5px 15px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)' }}>
                    {story.location}
                  </div>
                </div>
                <div style={{ padding: '30px' }}>
                  <Quote size={24} color="var(--primary)" style={{ opacity: 0.2, marginBottom: '15px' }} />
                  <p style={{ fontSize: '1.05rem', color: 'var(--secondary)', fontWeight: '500', lineHeight: '1.6', marginBottom: '20px' }}>&quot;{story.story}&quot;</p>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', margin: 0 }}>{story.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>SakhiHub Member</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Mission Timeline & Roadmap */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>THE ROADMAP</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginTop: '15px' }}>Our Journey <span className="text-gradient">& Future</span></h2>
          </div>

          <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
            {/* Center Line */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#eee', transform: 'translateX(-50%)' }}></div>

            {[
              { year: '2021', title: 'The Genesis', desc: 'Started with 5 villages and 100 women in Bihar.', align: 'left' },
              { year: '2022', title: 'Expansion', desc: 'Reached 10 districts with dedicated field teams.', align: 'right' },
              { year: '2023', title: 'Digital Shift', desc: 'Launched digital literacy and online support networks.', align: 'left' },
              { year: '2024', title: 'The Milestone', desc: '50,000 active members and 22 states impact.', align: 'right' },
              { year: '2025', title: 'Vision 2025', desc: 'Aiming for 200,000 members and full self-reliance models.', align: 'left', future: true },
              { year: '2026', title: 'National Impact', desc: 'Reaching 1 Million women across India.', align: 'right', future: true }
            ].map((milestone, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: milestone.align === 'left' ? 'flex-start' : 'flex-end',
                width: '100%',
                marginBottom: '60px',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  left: '50%', 
                  top: '20px', 
                  width: '20px', 
                  height: '20px', 
                  background: milestone.future ? 'white' : 'var(--primary)', 
                  border: `4px solid ${milestone.future ? '#eee' : 'var(--primary)'}`,
                  borderRadius: '50%', 
                  transform: 'translateX(-50%)',
                  zIndex: 2
                }}></div>

                <motion.div 
                  {...fadeInUp}
                  style={{ 
                    width: '45%', 
                    padding: '30px', 
                    background: milestone.future ? '#f9f9f9' : 'white', 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    border: milestone.future ? '2px dashed #eee' : '1px solid #f2f2f2'
                  }}
                >
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: milestone.future ? '#999' : 'var(--primary)', marginBottom: '10px', display: 'block' }}>{milestone.year}</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '10px' }}>{milestone.title}</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{milestone.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
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
            <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '30px' }}>Write the Next Chapter <br /> With Us</h2>
            <p style={{ fontSize: '1.4rem', opacity: 0.9, marginBottom: '50px', maxWidth: '800px', margin: '0 auto 50px' }}>
              Whether as a member, a volunteer, or a partner, your contribution can change a life today.
            </p>
            <div style={{ display: 'flex', gap: '25px', justifyContent: 'center' }}>
              <Link href="/register" className="btn-secondary" style={{ background: 'white', color: 'var(--secondary)', padding: '22px 60px', fontSize: '1.2rem', borderRadius: '100px' }}>
                Join the Revolution
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
