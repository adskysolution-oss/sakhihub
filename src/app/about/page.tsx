'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Shield, Heart, Users, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const stats = [
    { label: 'Women Joined', value: '50,000+', icon: <Users size={24} /> },
    { label: 'Groups Created', value: '12,500+', icon: <Eye size={24} /> },
    { label: 'Active Campaigns', value: '350+', icon: <Target size={24} /> },
    { label: 'Field Employees', value: '1,200+', icon: <Shield size={24} /> },
  ];

  const whatWeDo = [
    { title: 'Awareness', desc: 'Providing ground-level education on health, hygiene, and rights.', icon: <Heart /> },
    { title: 'Health', desc: 'Direct access to quality hygiene products and regular health camps.', icon: <Shield /> },
    { title: 'Community', desc: 'Building strong networks of local women leaders for collective growth.', icon: <Users /> },
    { title: 'Financial', desc: 'Enabling sustainable employment and financial independence.', icon: <DollarSign /> },
  ];

  const whyChooseUs = [
    { title: 'Grassroots Reach', desc: 'We operate directly in remote villages where help is needed most.' },
    { title: 'Empowerment Focused', desc: 'Our model is designed to make every woman a self-reliant leader.' },
    { title: 'Proven Impact', desc: 'Over 50,000 women have already transformed their lives through us.' },
    { title: 'Transparent System', desc: 'Clear reporting and direct benefit transfer to our community.' },
  ];

  return (
    <div style={{ background: 'white' }}>
      {/* 1. Hero Section (Split Layout) */}
      <section style={{ padding: '120px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <motion.div {...fadeInUp}>
              <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>About SakhiHub</span>
              <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '30px', marginTop: '10px' }}>
                Empowering Women <br />
                <span className="text-gradient">Transforming Lives</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '40px', maxWidth: '600px' }}>
                SakhiHub is a movement dedicated to the holistic empowerment of women across India. 
                From health awareness to financial independence, we provide the tools for a brighter tomorrow.
              </p>
              <div style={{ display: 'flex', gap: '20px' }}>
                <Link href="/register" className="btn-primary">Join Movement</Link>
                <Link href="/contact" className="btn-secondary">Contact Us</Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ position: 'relative' }}
            >
              <div style={{ 
                borderRadius: '30px', 
                overflow: 'hidden', 
                boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
                height: '600px'
              }}>
                <img src="/images/about_mission.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="SakhiHub Mission" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Mission & Vision */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <motion.div {...fadeInUp} className="glass-card" style={{ padding: '60px', background: 'white' }}>
              <div style={{ width: '70px', height: '70px', background: 'var(--grad-primary)', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <Target size={35} />
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Our Mission</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                To reach every woman in rural India and provide her with the awareness, education, 
                and employment opportunities she needs to lead a life of dignity and self-reliance.
              </p>
            </motion.div>
            <motion.div {...fadeInUp} className="glass-card" style={{ padding: '60px', background: 'white' }}>
              <div style={{ width: '70px', height: '70px', background: 'var(--grad-secondary)', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <Eye size={35} />
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Our Vision</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                Creating a future where gender equality is not just an ideal, but a reality, 
                where every woman is financially independent and physically healthy.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. What We Do */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title" style={{ maxWidth: '800px', margin: '0 auto 80px' }}>
            <span>Our Core Focus</span>
            <h2 style={{ fontSize: '3.5rem' }}>Our Initiatives for <span className="text-gradient">Real Change</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            {whatWeDo.map((item, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="glass-card" 
                style={{ padding: '40px', textAlign: 'center', background: 'white' }}
              >
                <div style={{ color: 'var(--primary)', marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 40 })}
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Impact Stats */}
      <section className="section-padding" style={{ background: 'var(--grad-primary)', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
            {stats.map((stat, idx) => (
              <motion.div key={idx} {...fadeInUp}>
                <div style={{ marginBottom: '20px', opacity: 0.8, display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <h3 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '10px' }}>{stat.value}</h3>
                <p style={{ fontSize: '1.1rem', fontWeight: '500', opacity: 0.9 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Field Team Section */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div style={{ borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <img src="/images/team_field.png" style={{ width: '100%', height: '500px', objectFit: 'cover' }} alt="Our Field Heroes" />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span style={{ color: 'var(--secondary)', fontWeight: '800', letterSpacing: '2px' }}>Our Field Heroes</span>
              <h2 style={{ fontSize: '3rem', margin: '15px 0 30px' }}>The Heart of <br />Our <span className="text-gradient">Network</span></h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '30px' }}>
                Our field employees and village leaders are the true backbone of SakhiHub. They bridge the gap 
                between resources and the women who need them most, working day and night across villages.
              </p>
              <Link href="/hiring" className="btn-secondary">Join Our Team <ArrowRight size={20} /></Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div className="section-title" style={{ marginBottom: '60px' }}>
            <span>Why SakhiHub</span>
            <h2 style={{ fontSize: '3rem' }}>Why We Stand <span className="text-gradient">Apart</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
            {whyChooseUs.map((item, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                className="glass-card" 
                style={{ padding: '30px', background: 'white' }}
              >
                <CheckCircle size={30} color="var(--primary)" style={{ marginBottom: '20px' }} />
                <h4 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ 
              background: 'var(--grad-primary)', 
              borderRadius: '40px', 
              padding: '80px', 
              textAlign: 'center', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background pattern */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, background: 'url(/images/pattern.png) repeat' }}></div>
            
            <h2 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '30px', position: 'relative', zIndex: 1 }}>Be Part of the Revolution</h2>
            <p style={{ fontSize: '1.3rem', opacity: 0.9, marginBottom: '50px', maxWidth: '800px', margin: '0 auto 50px', position: 'relative', zIndex: 1 }}>
              Whether you want to join as a member, start a campaign in your village, or work with us, 
              there is a place for every woman at SakhiHub.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Link href="/register" className="btn-secondary" style={{ padding: '18px 45px', fontSize: '1.1rem', background: 'white', color: 'var(--secondary)' }}>Join as Member</Link>
              <Link href="/hiring" className="btn-primary" style={{ padding: '18px 45px', fontSize: '1.1rem', border: '2px solid white' }}>Work With Us</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
