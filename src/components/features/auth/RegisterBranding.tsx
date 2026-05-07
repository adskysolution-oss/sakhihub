'use client';

import React from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Heart, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterBranding() {
  const stats = [
    { number: "50,000+", label: "Women Empowered", icon: Heart },
    { number: "1,200+", label: "Field Heroes", icon: ShieldCheck },
  ];

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #2E0249, #570A57)', 
      padding: '60px', 
      color: 'white', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      justifyContent: 'space-between'
    }}>
      {/* Dynamic Background Overlays */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', opacity: 0.1, zIndex: 1 }}>
        <Image 
          src="/assets/register-hero.png" 
          alt="Impact Background" 
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      {/* Glassmorphic Background Blobs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'rgba(233, 30, 99, 0.15)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(106, 27, 154, 0.3)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 1 }}></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: 'relative', zIndex: 5 }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '60px', textDecoration: 'none' }}>
          <div style={{ width: '44px', height: '44px', background: 'var(--grad-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)' }}>
            <Users size={24} color="white" />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>SakhiHub</span>
        </Link>

        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '10px', 
          padding: '10px 20px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(10px)', 
          borderRadius: '100px', 
          color: 'white', 
          fontSize: '0.85rem', 
          fontWeight: '700', 
          marginBottom: '32px', 
          border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <Sparkles size={16} color="#E91E63" />
          Real People • Real Impact • Real Trust
        </div>

        <h1 style={{ fontSize: '3.8rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
          The Hearts Behind <br />
          <span className="text-gradient" style={{ filter: 'brightness(1.8)' }}>SakhiHub</span>
        </h1>
        
        <p style={{ fontSize: '1.25rem', opacity: 0.9, lineHeight: '1.7', maxWidth: '520px', marginBottom: '40px', color: '#E0E0E0' }}>
          Our field team works at the grassroots level, connecting directly with women in villages to build a stronger, independent India.
        </p>

        {/* Feature List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '50px' }}>
          {['Ground-level Awareness', 'Trust-based Community', 'Verified Growth Network'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(233, 30, 99, 0.2)', padding: '4px', borderRadius: '50%' }}>
                <CheckCircle2 size={18} color="#E91E63" />
              </div>
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Image & Stats Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        style={{ position: 'relative', zIndex: 5, padding: '20px' }}
      >
        <div style={{ position: 'relative', height: '240px', width: '100%' }}>
          {/* Main Image Overlay */}
          <div style={{ 
            position: 'absolute', 
            left: '0', 
            bottom: '0', 
            width: '280px', 
            height: '180px', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '4px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <Image src="/assets/women-group.png" alt="Women Group" fill style={{ objectFit: 'cover' }} />
          </div>

          {/* Secondary Image Overlay */}
          <div style={{ 
            position: 'absolute', 
            right: '20px', 
            top: '0', 
            width: '200px', 
            height: '220px', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            border: '4px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <Image src="/assets/field-work.png" alt="Field Work" fill style={{ objectFit: 'cover' }} />
          </div>

          {/* Floating Stats Badge */}
          <div style={{ 
            position: 'absolute', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '16px 24px',
            borderRadius: '20px',
            color: '#2E0249',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#E91E63' }}>50k+</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.6 }}>Active Sakhis</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

