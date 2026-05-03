'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Users, GraduationCap, DollarSign, TrendingUp } from 'lucide-react';

const steps = [
  { 
    title: "Awareness", 
    icon: <MessageCircle size={32} />, 
    desc: "Spreading knowledge about health and hygiene in villages." 
  },
  { 
    title: "Group", 
    icon: <Users size={32} />, 
    desc: "Forming local support networks of empowered women." 
  },
  { 
    title: "Training", 
    icon: <GraduationCap size={32} />, 
    desc: "Providing skills and leadership development sessions." 
  },
  { 
    title: "Income", 
    icon: <DollarSign size={32} />, 
    desc: "Creating sustainable local employment opportunities." 
  },
  { 
    title: "Growth", 
    icon: <TrendingUp size={32} />, 
    desc: "Building a self-reliant and confident future together." 
  }
];

const HowItWorks = () => {
  return (
    <section className="section-padding" style={{ background: 'white' }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Our Process</span>
          <h2 style={{ fontSize: '3.5rem', marginTop: '10px' }}>How It <span className="text-gradient">Works</span></h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ 
                  flex: '1', 
                  minWidth: '200px', 
                  maxWidth: '240px', 
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#FFF7FB',
                  borderRadius: '30px',
                  border: '1px solid rgba(233, 30, 99, 0.1)',
                  boxShadow: '0 10px 30px rgba(233, 30, 99, 0.05)',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  background: 'linear-gradient(135deg, #E91E63, #6A1B9A)', 
                  color: 'white', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  boxShadow: '0 10px 20px rgba(233, 30, 99, 0.2)'
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '12px', fontWeight: '800' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{step.desc}</p>
                
                {/* Step Number Badge */}
                <div style={{ 
                  position: 'absolute', 
                  top: '15px', 
                  right: '15px', 
                  width: '30px', 
                  height: '30px', 
                  borderRadius: '50%', 
                  background: 'white', 
                  color: 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '900',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.05)'
                }}>
                  {i + 1}
                </div>
              </motion.div>
              {i < steps.length - 1 && (
                <div style={{ alignSelf: 'center', opacity: 0.3, display: 'flex', alignItems: 'center', padding: '10px' }} className="hide-mobile">
                  <ArrowRight size={32} color="var(--primary)" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
