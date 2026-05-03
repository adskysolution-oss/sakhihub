'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap, BookOpen, Briefcase, Brain, CheckCircle, ArrowRight, Users, Target, Layout } from 'lucide-react';
import Link from 'next/link';
import PageBannerSlider from "@/components/common/PageBannerSlider";

const programsData = [
  {
    title: "Menstrual Hygiene Awareness",
    hindi: "मासिक धर्म स्वच्छता जागरूकता",
    icon: <Heart size={24} />,
    image: "/images/campaign_sanitary.png",
    points: ["Period Hygiene Education", "Safe Disposal Methods", "Free Sanitary Kits"],
    color: "#E91E63"
  },
  {
    title: "Women Health & Hygiene",
    hindi: "महिला स्वास्थ्य एवं स्वच्छता",
    icon: <Shield size={24} />,
    image: "/images/campaign_health.png",
    points: ["Regular Health Camps", "Doctor Consultation", "Infection Prevention"],
    color: "#6A1B9A"
  },
  {
    title: "Women Empowerment",
    hindi: "महिला सशक्तिकरण",
    icon: <Zap size={24} />,
    image: "/images/about_mission.png",
    points: ["Leadership Training", "Rights Awareness", "Collective Voice"],
    color: "#E91E63"
  },
  {
    title: "Education & Skill Development",
    hindi: "शिक्षा एवं कौशल विकास",
    icon: <BookOpen size={24} />,
    image: "/images/program_skill.png",
    points: ["Technical Training", "Digital Literacy", "Vocational Skills"],
    color: "#6A1B9A"
  },
  {
    title: "Employment & Self-Reliance",
    hindi: "रोजगार एवं आत्मनिर्भरता",
    icon: <Briefcase size={24} />,
    image: "/images/team_field.png",
    points: ["Job Opportunities", "Small Business Support", "Financial Inclusion"],
    color: "#E91E63"
  },
  {
    title: "Health, Nutrition & Mental Health",
    hindi: "स्वास्थ्य, पोषण और मानसिक स्वास्थ्य",
    icon: <Brain size={24} />,
    image: "/images/hero_awareness_campaign.png",
    points: ["Nutrition Guidance", "Mental Health Support", "Counseling Sessions"],
    color: "#6A1B9A"
  }
];

const howItWorks = [
  { step: "01", title: "Awareness Session", desc: "Interactive awareness sessions in villages and communities." },
  { step: "02", title: "Group Formation", desc: "Organizing local women into self-help and support groups." },
  { step: "03", title: "Membership Registration", desc: "Joining the SakhiHub network for ongoing support and benefits." },
  { step: "04", title: "Training & Support", desc: "Providing necessary skills, products, and operational guidance." }
];

const stats = [
  { label: 'Women Reached', value: '50,000+', icon: <Users size={24} />, color: '#E91E63' },
  { label: 'Groups Created', value: '12,500+', icon: <Layout size={24} />, color: '#6A1B9A' },
  { label: 'Awareness Drives', value: '350+', icon: <Target size={24} />, color: '#E91E63' },
  { label: 'Field Employees', value: '1,200+', icon: <Users size={24} />, color: '#6A1B9A' },
];

export default function ProgramsPage() {
  const sliderImages = [
    "/images/hero_awareness_campaign.png",
    "/images/program_skill.png",
    "/images/about_mission.png",
    "/images/campaign_health.png",
    "/images/campaign_sanitary.png"
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div style={{ background: 'white' }}>
      <PageBannerSlider 
        title="Our Programs" 
        subtitle="Awareness, Health, Education & Self-Reliance for Every Woman"
        images={sliderImages}
      />

      {/* 2. Program Cards Grid */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '40px' }}>
            {programsData.map((prog, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="glass-card" 
                style={{ padding: '0', overflow: 'hidden', background: 'white', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative', height: '240px' }}>
                  <img src={prog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={prog.title} />
                  <div style={{ position: 'absolute', top: '20px', left: '20px', width: '50px', height: '50px', borderRadius: '15px', background: 'white', color: prog.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-soft)' }}>
                    {prog.icon}
                  </div>
                </div>
                <div style={{ padding: '35px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--secondary)' }}>{prog.hindi}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>{prog.title}</p>
                  
                  <div style={{ marginBottom: '30px', flex: 1 }}>
                    {prog.points.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        <CheckCircle size={16} color="var(--primary)" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <Link href="/programs/details" className="btn-secondary" style={{ padding: '12px', fontSize: '0.85rem', justifyContent: 'center' }}>Learn More</Link>
                    <Link href="/register" className="btn-primary" style={{ padding: '12px', fontSize: '0.85rem', justifyContent: 'center' }}>Join Program</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How Our Programs Work */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div className="section-title">
            <span>Our Process</span>
            <h2 style={{ fontSize: '3rem' }}>How SakhiHub Works <span className="text-gradient">on Ground</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', position: 'relative' }}>
            {howItWorks.map((step, idx) => (
              <motion.div key={idx} {...fadeInUp} className="glass-card" style={{ padding: '40px', background: 'white', textAlign: 'center', borderTop: `4px solid ${idx % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'}` }}>
                <div style={{ fontSize: '3rem', fontWeight: '900', color: 'rgba(0,0,0,0.05)', marginBottom: '-30px' }}>{step.step}</div>
                <h4 style={{ fontSize: '1.4rem', marginBottom: '15px', position: 'relative', zIndex: 1 }}>{step.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Impact Stats */}
      <section className="section-padding">
        <div className="container">
          <div className="glass-card" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '20px', 
            padding: '60px 40px',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: 'var(--shadow-hard)'
          }}>
            {stats.map((stat, idx) => (
              <motion.div key={idx} {...fadeInUp} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: stat.color }}>{stat.icon}</div>
                <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', lineHeight: '1' }}>{stat.value}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '600', marginTop: '10px' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ 
              background: 'var(--grad-secondary)', 
              borderRadius: '40px', 
              padding: '80px', 
              textAlign: 'center', 
              color: 'white'
            }}
          >
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '30px' }}>Want to Start a Program in Your Area?</h2>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px' }}>
              We are constantly expanding to new villages and districts. Partner with us to bring 
              health and empowerment to the women in your community.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link href="/register" className="btn-primary" style={{ padding: '18px 45px', fontSize: '1.1rem', background: 'white', color: 'var(--secondary)' }}>Join Now</Link>
              <Link href="/contact" className="btn-secondary" style={{ padding: '18px 45px', fontSize: '1.1rem', border: '2px solid white' }}>Contact Team</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
