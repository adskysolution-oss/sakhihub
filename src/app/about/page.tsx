'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Shield, Heart, Users, DollarSign, CheckCircle, ArrowRight, Briefcase, MapPin } from 'lucide-react';
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
    { title: 'Awareness', desc: 'Providing ground-level education on health, hygiene, and rights.', icon: Heart },
    { title: 'Health', desc: 'Direct access to quality hygiene products and regular health camps.', icon: Shield },
    { title: 'Community', desc: 'Building strong networks of local women leaders for collective growth.', icon: Users },
    { title: 'Financial', desc: 'Enabling sustainable employment and financial independence.', icon: DollarSign },
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
      <section className="section-padding" style={{ background: '#FFF5F8' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '40px' }}>
            {/* Card 1: Mission */}
            <motion.div 
              {...fadeInUp} 
              whileHover={{ y: -10, boxShadow: '0 30px 80px rgba(106,27,154,0.12)' }}
              style={{ 
                padding: '48px', 
                background: 'white', 
                borderRadius: '28px', 
                height: '420px', 
                position: 'relative', 
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(106,27,154,0.08)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'linear-gradient(135deg, #E91E63, #6A1B9A)', 
                color: 'white', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '30px' 
              }}>
                <Target size={32} />
              </div>
              <h2 style={{ fontSize: '42px', marginBottom: '20px', color: 'var(--secondary)', lineHeight: '1.2' }}>Our Mission</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                To reach every woman in rural and urban India and provide awareness, education, health guidance, and income opportunities.
              </p>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {['Women Awareness', 'Health & Hygiene', 'Employment Support'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary)' }}>
                    <CheckCircle size={14} /> {item}
                  </div>
                ))}
              </div>
              <img src="/images/hero_awareness_campaign.png" style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '80px', objectFit: 'cover', borderRadius: '15px', opacity: 0.1, transform: 'rotate(-10deg)' }} alt="" />
            </motion.div>

            {/* Card 2: Vision */}
            <motion.div 
              {...fadeInUp} 
              whileHover={{ y: -10, boxShadow: '0 30px 80px rgba(106,27,154,0.12)' }}
              style={{ 
                padding: '48px', 
                background: 'white', 
                borderRadius: '28px', 
                height: '420px', 
                position: 'relative', 
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(106,27,154,0.08)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                background: 'linear-gradient(135deg, #6A1B9A, #E91E63)', 
                color: 'white', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '30px' 
              }}>
                <Eye size={32} />
              </div>
              <h2 style={{ fontSize: '42px', marginBottom: '20px', color: 'var(--secondary)', lineHeight: '1.2' }}>Our Vision</h2>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '25px' }}>
                To build a future where every woman is educated, financially independent, socially respected, and physically healthy.
              </p>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {['Gender Equality', 'Financial Independence', 'Strong Communities'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--secondary)' }}>
                    <CheckCircle size={14} /> {item}
                  </div>
                ))}
              </div>
              <img src="/images/about_mission.png" style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '120px', height: '80px', objectFit: 'cover', borderRadius: '15px', opacity: 0.1, transform: 'rotate(-10deg)' }} alt="" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Our Core Work */}
      <section className="section-padding" style={{ background: '#FFF7FB' }}>
        <div className="container">
          <div className="section-title" style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>OUR CORE WORK</span>
            <h2 style={{ fontSize: '3.5rem', marginTop: '10px' }}>Our Initiatives for <span className="text-gradient">Real Change</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.1rem' }}>
              SakhiHub works at ground level to create awareness, build communities, and empower women for a better future.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px', marginBottom: '80px' }}>
            {[
              { 
                hindi: "मासिक धर्म एवं स्वास्थ्य जागरूकता", 
                english: "Health Awareness", 
                desc: "Promoting menstrual hygiene and overall women health through awareness campaigns.",
                points: ["Period awareness", "Health education", "Village outreach"],
                image: "/images/campaign_sanitary.png",
                icon: <Heart size={20} />
              },
              { 
                hindi: "स्वच्छता शिक्षा", 
                english: "Hygiene Education", 
                desc: "Providing scientific knowledge about hygiene, sanitation, and infection prevention.",
                points: ["Clean habits", "Sanitary awareness", "Health safety"],
                image: "/images/campaign_health.png",
                icon: <Shield size={20} />
              },
              { 
                hindi: "महिला समूह", 
                english: "Women Groups", 
                desc: "Creating strong local women networks for support, safety, and growth.",
                points: ["Group formation", "Leadership", "Community strength"],
                image: "/images/about_mission.png",
                icon: <Users size={20} />
              },
              { 
                hindi: "रोजगार", 
                english: "Employment", 
                desc: "Generating local job opportunities for women at block and village level.",
                points: ["Field jobs", "Local earning", "Career growth"],
                image: "/images/team_field.png",
                icon: <Briefcase size={20} />
              },
              { 
                hindi: "वितरण नेटवर्क", 
                english: "Delivery Network", 
                desc: "Building a strong distribution system to reach products and services everywhere.",
                points: ["Tehsil network", "Rural reach", "Fast delivery"],
                image: "/images/hero_awareness_campaign.png",
                icon: <MapPin size={20} />
              },
              { 
                hindi: "कौशल प्रशिक्षण", 
                english: "Skill Training", 
                desc: "Empowering women with practical skills to become financially independent.",
                points: ["Vocational skills", "Training programs", "Income generation"],
                image: "/images/program_skill.png",
                icon: <Target size={20} />
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10 }}
                style={{ 
                  padding: '0', 
                  background: 'white', 
                  borderRadius: '28px', 
                  height: '460px', 
                  overflow: 'hidden', 
                  boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    src={item.image} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={item.english} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-20px', 
                    left: '20px', 
                    width: '45px', 
                    height: '45px', 
                    background: 'linear-gradient(135deg, #E91E63, #6A1B9A)', 
                    color: 'white', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                    zIndex: 2
                  }}>
                    {item.icon}
                  </div>
                </div>
                <div style={{ padding: '35px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', display: 'block', marginBottom: '5px' }}>{item.hindi}</span>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--secondary)', fontWeight: '800' }}>{item.english}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '15px' }}>{item.desc}</p>
                  
                  <div style={{ marginBottom: '15px', flex: 1 }}>
                    {item.points.map((point, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>
                        <CheckCircle size={12} color="var(--primary)" /> {point}
                      </div>
                    ))}
                  </div>

                  <Link href="/programs" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem' }}>
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How It Works Process */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
             <h4 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '30px', color: 'var(--secondary)' }}>How It Works</h4>
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {['Awareness', 'Group', 'Training', 'Income', 'Growth'].map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="glass-card" style={{ padding: '15px 30px', background: 'white', borderRadius: '15px', fontWeight: '700', color: 'var(--primary)', border: '1px solid rgba(233, 30, 99, 0.2)' }}>
                      {step}
                    </div>
                    {i < 4 && <ArrowRight size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />}
                  </React.Fragment>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* 4. Impact Stats Banner */}
      <section className="section-padding" style={{ 
        position: 'relative', 
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        background: 'url(/images/hero_awareness_campaign.png) center/cover no-repeat fixed'
      }}>
        {/* Overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(135deg, rgba(46, 2, 73, 0.9), rgba(233, 30, 99, 0.8))',
          backdropFilter: 'blur(3px)',
          zIndex: 1
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '30px' }}>
            {[
              { label: 'Women Empowered', val: '50,000+', desc: 'Building a strong women network across India', icon: <Users size={24} /> },
              { label: 'Active Groups', val: '12,500+', desc: 'Connecting women at village level', icon: <Layout size={24} /> },
              { label: 'Awareness Drives', val: '350+', desc: 'Health & empowerment programs running', icon: <Target size={24} /> },
              { label: 'Field Team', val: '1,200+', desc: 'Working at ground level across districts', icon: <Shield size={24} /> },
            ].map((stat, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(255, 255, 255, 0.2)' }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  backdropFilter: 'blur(10px)',
                  padding: '40px 30px', 
                  borderRadius: '24px', 
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #E91E63, #6A1B9A)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px'
                }}>
                  {stat.icon}
                </div>
                <h3 style={{ fontSize: '40px', fontWeight: '900', color: 'var(--secondary)', lineHeight: '1', marginBottom: '10px' }}>{stat.val}</h3>
                <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>{stat.label}</p>
                <div style={{ width: '30px', height: '2px', background: 'var(--grad-primary)', margin: '0 auto 15px' }}></div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{stat.desc}</p>
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
      <section className="section-padding" style={{ background: '#FFF7FB' }}>
        <div className="container">
          <div className="section-title" style={{ marginBottom: '60px', textAlign: 'center' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>WHY SAKHIHUB</span>
            <h2 style={{ fontSize: '3rem', marginTop: '10px' }}>Why We Stand <span className="text-gradient">Apart</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.1rem' }}>
              Built on trust, driven by impact, and focused on real change at ground level.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}>
            {whyChooseUs.map((item, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10 }}
                style={{ 
                  padding: '0', 
                  background: 'white', 
                  borderRadius: '28px', 
                  height: '460px', 
                  overflow: 'hidden', 
                  boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <motion.img 
                    whileHover={{ scale: 1.1 }}
                    src={
                      idx === 0 ? '/images/team_field.png' :
                      idx === 1 ? '/images/about_mission.png' :
                      idx === 2 ? '/images/hero_main_banner.png' :
                      '/images/campaign_health.png'
                    } 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={item.title} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '-20px', 
                    left: '20px', 
                    width: '45px', 
                    height: '45px', 
                    background: 'linear-gradient(135deg, #6A1B9A, #E91E63)', 
                    color: 'white', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(106, 27, 154, 0.3)',
                    zIndex: 2
                  }}>
                    {idx === 0 ? <Users size={22} /> : 
                     idx === 1 ? <Target size={22} /> : 
                     idx === 2 ? <Shield size={22} /> : 
                     <CheckCircle size={22} />}
                  </div>
                </div>
                <div style={{ padding: '35px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'var(--secondary)' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '15px' }}>{item.desc}</p>
                  
                  <div style={{ marginBottom: '20px', flex: 1 }}>
                    {(idx === 0 ? ['Direct outreach', 'Real field engagement', 'Local connection'] :
                      idx === 1 ? ['Skill development', 'Leadership building', 'Confidence growth'] :
                      idx === 2 ? ['50,000+ reached', 'Real success stories', 'Measurable impact'] :
                      ['Clear reporting', 'Direct benefit system', 'Trust & accountability']).map((point, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600', marginBottom: '6px' }}>
                        <CheckCircle size={12} color="var(--primary)" /> {point}
                      </div>
                    ))}
                  </div>

                  <Link href="/about" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem' }}>
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* MINI TRUST BAR */}
          <div className="glass-card" style={{ 
            background: 'white', 
            padding: '30px', 
            borderRadius: '24px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
          }}>
            {[
              { label: 'Women Empowered', val: '50,000+' },
              { label: 'Groups', val: '12,500+' },
              { label: 'Campaigns', val: '350+' },
              { label: 'Ground-Level Work', val: '100%' }
            ].map((stat, i) => (
              <div key={i} style={{ borderRight: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <h4 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: '900', lineHeight: '1' }}>{stat.val}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px', fontWeight: '700' }}>{stat.label}</p>
              </div>
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
