'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';

const whyCards = [
  { 
    title: "Grassroots Reach", 
    desc: "We work directly at the ground level, reaching remote villages where real support is needed.", 
    image: "/images/hero_join_movement.png",
    points: ["Direct village outreach", "Real field engagement", "Local women connection"]
  },
  { 
    title: "Empowerment Focused", 
    desc: "Our model is designed to make every woman confident, skilled, and self-reliant.", 
    image: "/images/about_mission.png",
    points: ["Skill development", "Leadership building", "Confidence growth"]
  },
  { 
    title: "Proven Impact", 
    desc: "Thousands of women have already transformed their lives through SakhiHub.", 
    image: "/images/team_field.png",
    points: ["50,000+ women reached", "Real success stories", "Measurable impact"]
  },
  { 
    title: "Transparent System", 
    desc: "We maintain full transparency in our operations and benefits distribution.", 
    image: "/images/hero_awareness_campaign.png",
    points: ["Clear reporting", "Accountability", "Direct impact tracking"]
  },
];

const WhySakhiHub = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding" style={{ background: '#FFF7FB' }}>
      <div className="container">
        <div className="section-title" style={{ marginBottom: '60px', textAlign: 'center' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Why SakhiHub</span>
          <h2 style={{ fontSize: '3.5rem', marginTop: '10px' }}>Why We Stand <span className="text-gradient">Apart</span></h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.1rem', maxWidth: '800px', margin: '20px auto 0' }}>
            Built on trust, driven by impact, and focused on real change at ground level.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {whyCards.map((card, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              style={{ 
                background: 'white', 
                borderRadius: '28px', 
                overflow: 'hidden', 
                boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img src={card.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={card.title} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
              </div>
              <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '15px', fontWeight: '800' }}>{card.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>{card.desc}</p>
                
                <div style={{ marginBottom: '25px', flex: 1 }}>
                  {card.points.map((point, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', marginBottom: '8px' }}>
                      <CheckCircle size={16} color="var(--primary)" /> {point}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem' }}>
                  Real Ground Action <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySakhiHub;

