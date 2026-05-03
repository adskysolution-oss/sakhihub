'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Briefcase, MapPin, Target, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  { 
    hindi: "स्वास्थ्य जागरूकता", 
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
    hindi: "रोजगार अवसर", 
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
];

const WhatWeDo = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding" style={{ background: '#FFF7FB' }}>
      <div className="container">
        <div className="section-title" style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>OUR CORE WORK</span>
          <h2 style={{ fontSize: '3.5rem', marginTop: '10px' }}>Empowering Through <span className="text-gradient">Action</span></h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.1rem' }}>
            SakhiHub works at ground level to create awareness, build communities, and empower women for a better future.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          {services.map((item, idx) => (
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
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600', marginBottom: '4px' }}>
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
      </div>
    </section>
  );
};

export default WhatWeDo;
