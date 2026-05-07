'use client';

import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Activity, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HealthProgram = () => {
  const initiatives = [
    {
      title: "Sanitary Pad Distribution",
      desc: "Providing high-quality, eco-friendly sanitary pads to women in rural and urban areas to ensure menstrual health.",
      icon: ShieldCheck,
      img: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800"
    },
    {
      title: "Health Awareness Camps",
      desc: "Regular workshops and camps led by medical professionals to educate women on wellness, nutrition, and hygiene.",
      icon: Activity,
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800"
    },
    {
      title: "Village Health Committees",
      desc: "Forming local committees to monitor and support the health needs of the community at the grassroots level.",
      icon: Users,
      img: "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800"
    }
  ];

  return (
    <main>
      <PageBanner 
        title="Health & Hygiene" 
        subtitle="Dedicated to promoting wellness and menstrual dignity for every woman in India."
        image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1500"
      />

      {/* Intro Section */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px' }}>
                Why Menstrual Health <span className="text-gradient">Matters</span>
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '30px' }}>
                In many parts of India, health and hygiene remain a challenge due to lack of awareness and accessibility. 
                SakhiHub is on a mission to break the silence and provide tangible solutions.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '15px' }}>
                {[
                  "Reducing school dropouts due to lack of sanitary products",
                  "Preventing infections and serious health issues",
                  "Empowering women to talk about their health openly",
                  "Building a network of village health volunteers"
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--secondary)' }}>
                    <CheckCircle2 size={20} color="var(--primary)" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                borderRadius: '40px', 
                overflow: 'hidden', 
                height: '500px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Women Health Awareness"
                />
              </div>
              <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', background: 'var(--grad-primary)', padding: '30px', borderRadius: '30px', color: 'white', maxWidth: '250px' }}>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '900' }}>85%</h4>
                <p style={{ fontSize: '0.9rem', margin: 0, opacity: 0.9 }}>Improvement in local health awareness in SakhiHub villages.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Grid */}
      <section className="section-padding" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)' }}>Our Core <span className="text-gradient">Initiatives</span></h2>
            <p style={{ color: '#666', marginTop: '20px', fontSize: '1.2rem' }}>Practical solutions on the ground for real impact.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {initiatives.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                style={{
                  background: 'white',
                  borderRadius: '30px',
                  overflow: 'hidden',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                  border: '1px solid #eee'
                }}
              >
                <div style={{ height: '220px' }}>
                  <img src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} />
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: '#FFF5F8', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '20px'
                  }}>
                    <item.icon size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '15px' }}>{item.title}</h3>
                  <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>{item.desc}</p>
                  <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Learn More <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: 'var(--secondary)', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '30px' }}>Ready to Make a <span style={{ color: 'var(--primary)' }}>Difference?</span></h2>
          <p style={{ fontSize: '1.3rem', opacity: 0.8, maxWidth: '800px', margin: '0 auto 45px' }}>
            Whether you want to support our health camps or need products in your village, we are here for you.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '20px 45px', fontSize: '1.1rem' }}>
              Join the Movement
            </Link>
            <Link href="/contact" className="btn-secondary" style={{ padding: '20px 45px', fontSize: '1.1rem', background: 'transparent', border: '2px solid white' }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HealthProgram;

