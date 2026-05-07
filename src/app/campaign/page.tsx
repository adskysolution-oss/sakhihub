'use client';

import PageBanner from "@/components/common/PageBanner";
import React from "react";
import { CheckCircle, Target, Users, MapPin, Package, Heart, Globe, Sparkles, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import CampaignGallery from "@/components/campaign/CampaignGallery";

export default function CampaignPage() {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div style={{ background: '#fff' }}>
      <PageBanner 
        title="Awareness Campaign" 
        subtitle="Bringing health and dignity to the heart of every village."
        images={[
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1500",
          "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500",
          "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1500"
        ]}
      />
      
      {/* High Impact Intro */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '80px', alignItems: 'center' }}>
            <motion.div {...fadeInUp}>
              <span style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>A National Movement</span>
              <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', margin: '20px 0', lineHeight: '1.1' }}>
                Breaking Barriers, <span className="text-gradient">Building Health</span>
              </h2>
              <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: '1.8', marginBottom: '40px' }}>
                मासिक धर्म स्वच्छता जागरूकता अभियान के तहत SakhiHub गांव-गांव जाकर महिलाओं और बेटियों को period hygiene, sanitary pad use, और infection prevention की जानकारी देता है।
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                {[
                  'Period Hygiene Education',
                  'Infection Prevention',
                  'Safe Disposal Methods',
                  'Health Awareness',
                  'Community Support',
                  'Product Distribution'
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '15px', alignItems: 'center', color: 'var(--secondary)', fontWeight: '700' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#FFF5F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={16} color="var(--primary)" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary" style={{ padding: '20px 50px', fontSize: '1.1rem', borderRadius: '15px' }}>
                Join the Campaign <ArrowRight size={20} style={{ marginLeft: '10px' }} />
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ position: 'relative' }}
            >
               <div style={{ 
                borderRadius: '50px', 
                overflow: 'hidden', 
                height: '550px',
                boxShadow: '0 40px 100px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Campaign Mission"
                />
              </div>
              <div style={{ position: 'absolute', top: '40px', right: '-40px', background: 'white', padding: '30px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                <Target size={40} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>500+</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#999', fontWeight: '700' }}>VILLAGES REACHED</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ground reality replaced by Gallery */}
      <section className="section-padding" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)' }}>Campaign <span className="text-gradient">Gallery</span></h2>
            <p style={{ color: '#666', marginTop: '20px', fontSize: '1.2rem' }}>Explore our recent drives and join upcoming missions across India.</p>
          </div>
          <CampaignGallery />
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
            {[
              { val: '200+', label: 'Active Block Staff', icon: Users },
              { val: '1.2k+', label: 'Field Volunteers', icon: Heart },
              { val: '5k+', label: 'Monthly Sessions', icon: Activity },
              { val: '100+', label: 'Awards Won', icon: Sparkles },
            ].map((s, i) => (
              <motion.div key={i} {...fadeInUp}>
                <div style={{ color: 'var(--primary)', marginBottom: '20px' }}><s.icon size={45} /></div>
                <h3 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '10px' }}>{s.val}</h3>
                <p style={{ opacity: 0.8, fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding" style={{ background: '#fff', textAlign: 'center' }}>
        <div className="container">
          <div style={{ 
            background: 'var(--grad-primary)', 
            padding: '100px 50px', 
            borderRadius: '60px',
            color: 'white'
          }}>
            <Globe size={60} style={{ marginBottom: '30px' }} />
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '30px' }}>Be the Face of Change</h2>
            <p style={{ fontSize: '1.4rem', opacity: 0.9, maxWidth: '800px', margin: '0 auto 50px' }}>
              Whether you are an individual, a NGO, or a government body, let's collaborate to make India hygiene-safe.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link href="/register" className="btn-primary" style={{ background: 'white', color: 'var(--primary)', padding: '20px 50px', fontSize: '1.1rem' }}>
                 Join as Volunteer
              </Link>
              <Link href="/contact" className="btn-secondary" style={{ border: '2px solid white', padding: '20px 50px', fontSize: '1.1rem' }}>
                 Partner with Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
