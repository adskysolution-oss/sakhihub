'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PageBanner from '@/components/common/PageBanner';
import { CheckCircle, ArrowRight, ShieldCheck, Heart, Users, Zap, Globe, Target } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const programsData: Record<string, any> = {
  "menstrual-hygiene": {
    title: "Menstrual Hygiene Awareness",
    subtitle: "Breaking silence, ending stigma, and ensuring health for every woman.",
    image: "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500",
    impact: "50,000+ Women Educated",
    description: "Our flagship campaign focuses on providing deep-rooted education about menstrual health in rural blocks. We address traditional taboos and provide scientific knowledge on hygiene management.",
    features: [
      "School & Village Workshops",
      "Hygiene Kit Distribution",
      "Health Helpline Access",
      "Doctor Consultations"
    ],
    roadmap: [
      { year: "Phase 1", task: "Vulnerability mapping of rural blocks." },
      { year: "Phase 2", task: "Training of block-level educators." },
      { year: "Phase 3", task: "Monthly school awareness sessions." }
    ]
  },
  "digital-literacy": {
    title: "Digital Literacy & Skills",
    subtitle: "Empowering rural women with tools for the digital age.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1500",
    impact: "10,000+ Women Digitized",
    description: "Training women to use smartphones for banking, government schemes (Jan Dhan, PM-Kisan), and basic digital communication.",
    features: [
      "Smartphone Basics",
      "Online Banking & UPI",
      "Govt Scheme Navigation",
      "Digital Safety Training"
    ],
    roadmap: [
      { year: "Month 1", task: "Distribution of training manuals." },
      { year: "Month 2", task: "Hands-on smartphone workshops." },
      { year: "Month 3", task: "Certification and support group setup." }
    ]
  },
  // Add more as needed...
};

export default function ProgramDetail() {
  const { slug } = useParams();
  const program = programsData[slug as string] || programsData["menstrual-hygiene"];

  return (
    <div style={{ background: '#fff' }}>
      <PageBanner 
        title={program.title} 
        subtitle={program.subtitle} 
        image={program.image}
      />

      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '80px', alignItems: 'flex-start' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '30px' }}>Program <span className="text-gradient">Overview</span></h2>
              <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: '1.8', marginBottom: '40px' }}>
                {program.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '50px' }}>
                {program.features.map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '20px' }}>
                    <div style={{ color: 'var(--primary)' }}><CheckCircle size={24} /></div>
                    <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>Implementation Roadmap</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {program.roadmap.map((step: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '30px' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.1rem', minWidth: '100px' }}>{step.year}</div>
                    <div style={{ paddingBottom: '30px', borderLeft: '2px solid #eee', paddingLeft: '30px', position: 'relative' }}>
                       <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', position: 'absolute', left: '-7px', top: '5px' }}></div>
                       <p style={{ margin: 0, fontWeight: '600', color: '#444' }}>{step.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} style={{ position: 'sticky', top: '100px' }}>
              <div className="glass-card" style={{ padding: '50px', background: 'white', borderRadius: '40px', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.05)' }}>
                 <div style={{ width: '80px', height: '80px', background: '#FFF5F8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: 'var(--primary)' }}>
                    <Target size={40} />
                 </div>
                 <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '10px' }}>{program.impact.split(' ')[0]}</h3>
                 <p style={{ fontWeight: '800', textTransform: 'uppercase', color: '#999', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '40px' }}>Target Impact</p>
                 
                 <Link href="/contact" className="btn-primary" style={{ width: '100%', padding: '20px', borderRadius: '15px', justifyContent: 'center' }}>
                    Register for Program <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                 </Link>
                 <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>Interested in partnering? <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: '700' }}>Contact Us</Link></p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
