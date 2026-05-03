'use client';

import React from 'react';
import PageBanner from '@/components/common/PageBanner';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, TrendingUp, Award, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

const EmploymentProgram = () => {
  const opportunities = [
    {
      title: "Field Hero Program",
      desc: "Join our core workforce. Visit villages, build communities, and distribute essential health products.",
      icon: Briefcase,
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800"
    },
    {
      title: "Skill Training Center",
      desc: "Learn tailoring, digital literacy, and basic business management at our local training hubs.",
      icon: GraduationCap,
      img: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800"
    },
    {
      title: "Regional Team Lead",
      desc: "Experienced members can move up to management roles, overseeing operations in entire blocks or districts.",
      icon: TrendingUp,
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800"
    }
  ];

  return (
    <main>
      <PageBanner 
        title="Employment & Training" 
        subtitle="Empowering women to build sustainable careers and achieve financial independence."
        image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1500"
      />

      {/* Career Vision Section */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '80px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
               <div style={{ 
                borderRadius: '40px', 
                overflow: 'hidden', 
                height: '550px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
                border: '10px solid #f8f9fa'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Women working together"
                />
              </div>
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ position: 'absolute', top: '40px', left: '-40px', background: 'white', padding: '25px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #eee' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <div style={{ width: '50px', height: '50px', background: '#FFF5F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Award size={28} />
                   </div>
                   <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Certified</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>National Recognition</p>
                   </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px' }}>
                Your Path to <span className="text-gradient">Independence</span>
              </h2>
              <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '35px' }}>
                At SakhiHub, we believe that true empowerment comes from the ability to earn and lead. 
                Our employment programs are designed to provide stable income while building community leaders.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '40px' }}>
                {[
                  { title: "Stable Income", icon: Zap },
                  { title: "Skill Certification", icon: GraduationCap },
                  { title: "Local Deployment", icon: MapPin },
                  { title: "Growth Pathway", icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '20px' }}>
                    <item.icon size={20} color="var(--primary)" />
                    <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{item.title}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" className="btn-primary" style={{ padding: '20px 45px', fontSize: '1.1rem', borderRadius: '20px' }}>
                Apply for a Role
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pathways Section */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900' }}>Explore Your <span style={{ color: 'var(--primary)' }}>Potential</span></h2>
            <p style={{ opacity: 0.8, marginTop: '20px', fontSize: '1.2rem' }}>We offer multiple ways for you to grow with the SakhiHub family.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {opportunities.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '35px',
                  padding: '40px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ 
                  width: '70px', 
                  height: '70px', 
                  background: 'var(--grad-primary)', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '30px',
                  boxShadow: '0 15px 30px rgba(233, 30, 99, 0.3)'
                }}>
                  <item.icon size={35} color="white" />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '20px' }}>{item.title}</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.7', marginBottom: '30px', fontSize: '1.05rem' }}>{item.desc}</p>
                <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  Get Started <ArrowRight size={20} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Impact Stats */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
           <div style={{ background: 'var(--grad-primary)', borderRadius: '50px', padding: '80px', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '20px' }}>Join the 5,000+</h2>
                <p style={{ fontSize: '1.5rem', opacity: 0.9, marginBottom: '50px' }}>Women who have successfully trained and started earning with SakhiHub.</p>
                <div style={{ display: 'flex', gap: '60px', justifyContent: 'center' }}>
                   <div>
                      <h4 style={{ fontSize: '3rem', fontWeight: '900' }}>15+</h4>
                      <p style={{ fontWeight: '600' }}>Training Modules</p>
                   </div>
                   <div style={{ width: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                   <div>
                      <h4 style={{ fontSize: '3rem', fontWeight: '900' }}>₹8k-15k</h4>
                      <p style={{ fontWeight: '600' }}>Avg. Monthly Earning</p>
                   </div>
                   <div style={{ width: '2px', background: 'rgba(255,255,255,0.2)' }}></div>
                   <div>
                      <h4 style={{ fontSize: '3rem', fontWeight: '900' }}>22+</h4>
                      <p style={{ fontWeight: '600' }}>Districts Covered</p>
                   </div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '250px', height: '250px', background: 'white', opacity: 0.05, borderRadius: '50%' }}></div>
           </div>
        </div>
      </section>
    </main>
  );
};

export default EmploymentProgram;
