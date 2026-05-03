import React from 'react';
import HeroSlider from '@/components/home/HeroSlider';
import WhatWeDo from '@/components/home/WhatWeDo';
import ProgramsPreview from '@/components/home/ProgramsPreview';
import ProductShowcase from '@/components/home/ProductShowcase';
import Impact from '@/components/home/Impact';
import JoinMovement from '@/components/home/JoinMovement';
import CTABanner from '@/components/home/CTABanner';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Visual About Section */}
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '100%', 
                height: '600px', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                boxShadow: 'var(--shadow-hard)'
              }}>
                <img 
                  src="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1000" 
                  alt="SakhiHub Women Group" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {/* Floating Stat */}
              <div className="glass-card" style={{ 
                position: 'absolute', 
                bottom: '40px', 
                right: '-40px', 
                padding: '30px', 
                maxWidth: '220px',
                textAlign: 'center'
              }}>
                <h3 className="text-gradient" style={{ fontSize: '2.5rem' }}>10k+</h3>
                <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>Women Connected</p>
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>About SakhiHub</span>
              <h2 style={{ fontSize: '3.5rem', marginBottom: '30px', marginTop: '10px' }}>
                Empowering Women <br />
                <span className="text-gradient">Everywhere</span>
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.8' }}>
                SakhiHub is a dedicated platform for women's health, awareness, education, and self-reliance. 
                We operate at the grassroots level, building networks of empowered women who support each other.
                Our mission is to ensure every woman has access to quality hygiene products and sustainable employment opportunities.
              </p>
              <Link href="/about" className="btn-primary">
                Know More About Us <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Work / What We Do */}
      <WhatWeDo />

      {/* 4. Impact Section (Animated Counters) */}
      <Impact />

      {/* 5. Programs Preview */}
      <ProgramsPreview />

      {/* 6. Product Showcase */}
      <ProductShowcase />

      {/* 7. Gallery Preview (Grid) */}
      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>Visual Storytelling</span>
              <h2 style={{ fontSize: '3rem', marginTop: '10px' }}>Moments of <span className="text-gradient">Impact</span></h2>
            </div>
            <Link href="/gallery" className="btn-secondary">
              View All Photos <ImageIcon size={20} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(2, 250px)', gap: '20px' }}>
            <div style={{ gridColumn: 'span 2', gridRow: 'span 2', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src="/images/empowerment.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery 1" />
            </div>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=500" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery 2" />
            </div>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src="/images/delivery.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery 3" />
            </div>
            <div style={{ gridColumn: 'span 2', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src="/images/product.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Gallery 4" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Join Movement Section */}
      <JoinMovement />

      {/* 9. Strong CTA Banner */}
      <CTABanner />

      <div style={{ height: '100px' }}></div>
    </>
  );
}
