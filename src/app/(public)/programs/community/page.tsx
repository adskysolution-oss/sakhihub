'use client';

import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { motion } from 'framer-motion';
import { Users, Heart, Share2, ShieldCheck, Globe, CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const CommunityProgram = () => {
  return (
    <main>
      <PageBanner 
        title="Community Network" 
        subtitle="Building a powerful sisterhood where every woman supports another."
        image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1500"
      />

      {/* Connection Vision */}
      <section className="section-padding" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
             <div style={{ position: 'relative' }}>
                <div style={{ 
                  borderRadius: '40px', 
                  overflow: 'hidden', 
                  height: '550px',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.1)'
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=800" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt="Women holding hands"
                  />
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '-50px', transform: 'translateY(-50%)', background: 'var(--grad-primary)', padding: '40px', borderRadius: '40px', color: 'white', border: '5px solid white' }}>
                   <Share2 size={40} />
                </div>
             </div>

             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
             >
               <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px' }}>
                 Strength in <span className="text-gradient">Unity</span>
               </h2>
               <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: '1.8', marginBottom: '35px' }}>
                 Alone we are strong, but together we are unstoppable. SakhiHub creates local village groups 
                 where women can share resources, advice, and emotional support.
               </p>

               <div style={{ display: 'grid', gap: '25px', marginBottom: '40px' }}>
                  {[
                    { title: "Local Village Groups", desc: "Dedicated groups for every block to ensure no woman is left behind." },
                    { title: "Peer Support System", desc: "A safe space for sharing personal and professional challenges." },
                    { title: "Group Savings & Micro-aid", desc: "Financial assistance through community-led small savings." }
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '20px' }}>
                       <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: '#FFF5F8', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={18} />
                       </div>
                       <div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', marginBottom: '5px' }}>{item.title}</h4>
                          <p style={{ color: '#999', fontSize: '0.9rem', margin: 0 }}>{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Network Scale */}
      <section className="section-padding" style={{ background: '#f8f9fa' }}>
        <div className="container">
           <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)' }}>A Growing <span className="text-gradient">Brotherhood</span></h2>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
              {[
                { label: 'Village Groups', val: '500+', icon: Users },
                { label: 'Active Sakhis', val: '50k+', icon: Heart },
                { label: 'Success Stories', val: '1,200+', icon: ShieldCheck },
                { label: 'Total Reach', val: '100k+', icon: Globe },
              ].map((item, i) => (
                <div key={i} style={{ padding: '40px', background: 'white', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                   <div style={{ color: 'var(--primary)', marginBottom: '15px' }}><item.icon size={40} /></div>
                   <h3 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '5px' }}>{item.val}</h3>
                   <p style={{ color: '#999', fontWeight: '700', fontSize: '0.9rem' }}>{item.label}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Join the Network CTA */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
           <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '30px' }}>Don't Walk <span style={{ color: 'var(--primary)' }}>Alone</span></h2>
           <p style={{ fontSize: '1.3rem', opacity: 0.8, maxWidth: '800px', margin: '0 auto 50px' }}>
             Join the largest network of rural women in India. Be part of a group that understands you, supports you, and grows with you.
           </p>
           <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
             <Link href="/register" className="btn-primary" style={{ padding: '20px 50px', fontSize: '1.1rem' }}>
                Create Village Group
             </Link>
             <Link href="/contact" className="btn-secondary" style={{ padding: '20px 50px', fontSize: '1.1rem', background: 'transparent', border: '2px solid white' }}>
                Find My Group
             </Link>
           </div>
        </div>
      </section>
    </main>
  );
};

export default CommunityProgram;

