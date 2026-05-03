'use client';

import PageBanner from "@/components/common/PageBanner";
import React, { useState } from "react";

const categories = ['All', 'Events', 'Campaigns', 'Training', 'Products'];

const galleryItems = [
  { id: 1, category: 'Events', image: 'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800', title: 'Community Meeting' },
  { id: 2, category: 'Campaigns', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=801', title: 'Awareness Drive' },
  { id: 3, category: 'Training', image: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?q=80&w=802', title: 'Skill Workshop' },
  { id: 4, category: 'Products', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=803', title: 'Sakhi Care Pads' },
  { id: 5, category: 'Events', image: 'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=804', title: 'Group Discussion' },
  { id: 6, category: 'Campaigns', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=805', title: 'Field Visit' },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <>
      <PageBanner 
        title="Our Gallery" 
        subtitle="Capturing Moments of Change"
        image="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '50px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  padding: '10px 25px', 
                  borderRadius: '50px', 
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--bg-light)',
                  color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                  fontWeight: '600',
                  border: '1px solid rgba(108, 74, 182, 0.1)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {filteredItems.map(item => (
              <div key={item.id} className="glass-card" style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  style={{ width: '100%', height: '300px', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '20px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white' }}>
                  <span style={{ fontSize: '0.75rem', background: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', marginBottom: '5px', display: 'inline-block' }}>{item.category}</span>
                  <h4 style={{ fontSize: '1.1rem' }}>{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
