'use client';

import React from 'react';
import PageBanner from '@/components/common/PageBanner';
import { motion } from 'framer-motion';
import { BookOpen, Monitor, MessageCircle, Lightbulb, CheckCircle2, ArrowRight, Brain } from 'lucide-react';
import Link from 'next/link';

const EducationProgram = () => {
  const features = [
    {
      title: "Digital Literacy",
      desc: "Basic training on using smartphones, internet, and essential government apps for daily life.",
      icon: Monitor,
      color: "#6A1B9A"
    },
    {
      title: "Social Awareness",
      desc: "Workshops on legal rights, financial safety, and social welfare schemes available for women.",
      icon: Lightbulb,
      color: "#E91E63"
    },
    {
      title: "Soft Skills",
      desc: "Communication, leadership, and confidence-building sessions to prepare women for leadership roles.",
      icon: Brain,
      color: "#4CAF50"
    }
  ];

  return (
    <main>
      <PageBanner 
        title="Education & Awareness" 
        subtitle="Knowledge is the strongest tool for empowerment. We bridge the gap between information and action."
        image="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1500"
      />

      {/* Philosophy Section */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3.2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '30px' }}>
              Breaking the <span className="text-gradient">Silence of Ignorance</span>
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: '1.8', marginBottom: '50px' }}>
              Many women are held back not by lack of talent, but by lack of information. 
              Our education programs are designed to enlighten, inspire, and enable every woman 
              to navigate the modern world with confidence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: '#f8f9fa',
                  padding: '40px',
                  borderRadius: '35px',
                  textAlign: 'center',
                  border: '1px solid #eee'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  background: 'white', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  color: item.color,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                }}>
                  <item.icon size={30} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workshops */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '25px' }}>Community <span style={{ color: 'var(--primary)' }}>Learning Hubs</span></h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.8, lineHeight: '1.8', marginBottom: '35px' }}>
                We establish physical centers in blocks where women can gather to learn from each other 
                and from expert trainers. These hubs are the heart of our awareness campaigns.
              </p>
              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  "Weekly expert-led video sessions",
                  "Direct interaction with field officers",
                  "Hands-on practice with digital tools",
                  "Safe space for sharing and learning"
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
                    <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <CheckCircle2 size={16} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <div style={{ 
              borderRadius: '40px', 
              overflow: 'hidden', 
              height: '500px',
              border: '10px solid rgba(255,255,255,0.1)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb28f74b671?q=80&w=800" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt="Workshop Session"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Enroll */}
      <section className="section-padding" style={{ background: '#fff', textAlign: 'center' }}>
        <div className="container">
          <div style={{ 
            background: '#FFF5F8', 
            padding: '80px', 
            borderRadius: '50px',
            border: '2px dashed var(--primary)'
          }}>
            <BookOpen size={60} color="var(--primary)" style={{ marginBottom: '30px' }} />
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '20px' }}>Start Your Learning <span className="text-gradient">Journey</span></h2>
            <p style={{ fontSize: '1.3rem', color: '#666', maxWidth: '700px', margin: '0 auto 40px' }}>
              Education is a right, not a privilege. Join our next workshop and take the first step towards a smarter, brighter future.
            </p>
            <Link href="/register" className="btn-primary" style={{ padding: '20px 60px', fontSize: '1.2rem' }}>
               Join Training Program
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EducationProgram;
