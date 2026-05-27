'use client';

import PageBanner from "@/components/ui/PageBanner";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Calendar, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function GalleryPage() {
  const { t } = useLanguage();

  const categories = [
    t('galleryPage.catAll'), 
    t('galleryPage.catEvents'), 
    t('galleryPage.catTraining'), 
    t('galleryPage.catFieldWork'), 
    t('galleryPage.catProducts')
  ];

  const galleryItems = [
    { id: 1, category: t('galleryPage.catEvents'), image: 'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800', title: t('galleryPage.item1'), date: 'May 2024', location: 'Varanasi' },
    { id: 2, category: t('galleryPage.catTraining'), image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=801', title: t('galleryPage.item2'), date: 'April 2024', location: 'Lucknow' },
    { id: 3, category: t('galleryPage.catFieldWork'), image: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?q=80&w=802', title: t('galleryPage.item3'), date: 'April 2024', location: 'Prayagraj' },
    { id: 4, category: t('galleryPage.catProducts'), image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=803', title: t('galleryPage.item4'), date: 'March 2024', location: 'Plant' },
    { id: 5, category: t('galleryPage.catEvents'), image: 'https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=804', title: t('galleryPage.item5'), date: 'March 2024', location: 'Rampur' },
    { id: 6, category: t('galleryPage.catFieldWork'), image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=805', title: t('galleryPage.item6'), date: 'Feb 2024', location: 'Kashi' },
  ];
  const [activeCategory, setActiveCategory] = useState(t('galleryPage.catAll'));

  const filteredItems = activeCategory === t('galleryPage.catAll')
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <>
      <PageBanner 
        title={t('galleryPage.title')} 
        subtitle={t('galleryPage.subtitle')}
        image="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          {/* Category Filter */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '70px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{ 
                  padding: '14px 30px', 
                  borderRadius: '50px', 
                  background: activeCategory === cat ? 'var(--grad-primary)' : 'white',
                  color: activeCategory === cat ? 'white' : 'var(--text-muted)',
                  fontWeight: '700',
                  border: activeCategory === cat ? 'none' : '2px solid #eee',
                  boxShadow: activeCategory === cat ? 'var(--shadow-medium)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div 
            layout
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}
          >
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card"
                  style={{ overflow: 'hidden', position: 'relative', height: '500px' }}
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  
                  {/* Overlay */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(to top, rgba(26, 11, 46, 0.9) 0%, transparent 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '40px',
                    color: 'white',
                    opacity: 1,
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ 
                      background: 'var(--primary)', 
                      padding: '5px 15px', 
                      borderRadius: '50px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800', 
                      width: 'fit-content',
                      marginBottom: '15px'
                    }}>{item.category}</span>
                    
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>{item.title}</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', opacity: 0.8, fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} /> {item.date}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} /> {item.location}
                      </div>
                    </div>

                    <button style={{ 
                      position: 'absolute', 
                      top: '20px', 
                      right: '20px', 
                      background: 'rgba(255,255,255,0.2)', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '50px', 
                      height: '50px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer'
                    }}>
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}

