'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Briefcase, CheckCircle, ArrowRight, Users } from 'lucide-react';
import Link from 'next/link';
import PageBanner from "@/components/ui/PageBanner";

const programsData = [
  {
    slug: "health",
    title: "Health & Hygiene Awareness",
    icon: <Heart size={28} />,
    image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200",
    desc: "Dedicated to promoting wellness and menstrual dignity for every woman in rural India through awareness and eco-friendly products.",
    points: ["Period Hygiene Education", "Safe Disposal Methods", "Free Sanitary Kits"],
    color: "#E91E63"
  },
  {
    slug: "employment",
    title: "Employment & Self-Reliance",
    icon: <Briefcase size={28} />,
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200",
    desc: "Empowering women to build sustainable careers and achieve financial independence through field work and team leadership roles.",
    points: ["Job Opportunities", "Small Business Support", "Financial Inclusion"],
    color: "#6A1B9A"
  },
  {
    slug: "education",
    title: "Education & Skill Development",
    icon: <BookOpen size={28} />,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200",
    desc: "Knowledge is the strongest tool for empowerment. We bridge the gap between information and action via digital literacy.",
    points: ["Technical Training", "Digital Literacy", "Vocational Skills"],
    color: "#4CAF50"
  },
  {
    slug: "community",
    title: "Community Network",
    icon: <Users size={28} />,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200",
    desc: "Building a powerful sisterhood where every woman supports another through local village groups and support networks.",
    points: ["Leadership Training", "Rights Awareness", "Collective Voice"],
    color: "#FF9800"
  }
];

export default function ProgramsPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <div style={{ background: '#fff' }}>
      <PageBanner 
        title="Our Programs" 
        subtitle="Impactful initiatives driving national transformation at the grassroots level."
        images={[
          "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500",
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1500",
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200"
        ]}
      />

      {/* Intro Stats */}
      <section style={{ marginTop: '-60px', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div style={{ 
            background: 'white', 
            borderRadius: '40px', 
            padding: '45px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            boxShadow: '0 30px 70px rgba(0,0,0,0.1)',
            border: '1px solid #f2f2f2'
          }}>
            {[
              { val: "50k+", label: "Women Empowered" },
              { val: "22+", label: "States Impacted" },
              { val: "1.2k+", label: "Field Agents" },
              { val: "500+", label: "Village Groups" }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px' }}>
                <h3 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '5px' }}>{s.val}</h3>
                <p style={{ fontSize: '0.9rem', color: '#999', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Flow */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '100px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Empowering Millions
            </span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '10px' }}>
               Exploring Our <span className="text-gradient">Vision</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '150px' }}>
            {programsData.map((prog, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '80px', 
                  alignItems: 'center' 
                }}
              >
                {idx % 2 !== 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      borderRadius: '50px', 
                      overflow: 'hidden', 
                      height: '500px',
                      boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
                    }}>
                      <img src={prog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={prog.title} />
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    background: '#FFF5F8', 
                    borderRadius: '20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '30px',
                    boxShadow: '0 10px 20px rgba(233, 30, 99, 0.1)'
                  }}>
                    {prog.icon}
                  </div>
                  <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '25px', lineHeight: '1.1' }}>
                    {prog.title}
                  </h2>
                  <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '35px' }}>
                    {prog.desc}
                  </p>
                  
                  <div style={{ display: 'grid', gap: '18px', marginBottom: '45px' }}>
                    {prog.points.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '700', color: 'var(--secondary)', fontSize: '1.05rem' }}>
                        <CheckCircle size={22} color="var(--primary)" /> {p}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <Link href={`/programs/${prog.slug}`} className="btn-primary" style={{ padding: '20px 45px', fontSize: '1.1rem', borderRadius: '18px' }}>
                      Details <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                    </Link>
                    <Link href="/register" className="btn-secondary" style={{ padding: '20px 45px', fontSize: '1.1rem', border: '1px solid #ddd', borderRadius: '18px' }}>
                      Join the Movement
                    </Link>
                  </div>
                </div>

                {idx % 2 === 0 && (
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      borderRadius: '50px', 
                      overflow: 'hidden', 
                      height: '500px',
                      boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
                    }}>
                      <img src={prog.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={prog.title} />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '30px' }}>
            Ready to Lead the <span style={{ color: 'var(--primary)' }}>Change?</span>
          </h2>
          <p style={{ fontSize: '1.4rem', opacity: 0.8, maxWidth: '850px', margin: '0 auto 50px' }}>
            Join our mission as a Field Hero or Team Lead and help us reach every village in India.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link href="/register" className="btn-primary" style={{ padding: '22px 65px', fontSize: '1.3rem', borderRadius: '120px' }}>
               Start Your Journey
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
