'use client';

import PageBanner from "@/components/common/PageBanner";
import React from "react";
import { CheckCircle2, MessageCircle, Phone, Info, ShoppingBag, Star, ShieldCheck, Zap, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const products = [
  {
    name: "Sakhi Care Pads - Regular Pack",
    size: "16 Pads (Regular + XL)",
    mrp: 100,
    offer: 80,
    tag: "Most Popular",
    details: "Perfect for daily comfort and high activity days.",
    features: ["Soft Cottony Surface", "Advanced Absorbency", "Anti-Leak Side Walls", "Skin-Safe & Breathable"],
    image: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800"
  },
  {
    name: "Sakhi Care Pads - Family Pack",
    size: "24 Pads (XL + XXL)",
    mrp: 150,
    offer: 120,
    tag: "Best Value",
    details: "All-day and overnight protection for the whole family.",
    features: ["Extra Large Coverage", "Dual-Layer Protection", "Zero Leakage Tech", "Night-Use Optimized", "Eco-Friendly Design"],
    image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=800"
  }
];

export default function ProductsPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div style={{ background: '#fff' }}>
      <PageBanner 
        title="Premium Products" 
        subtitle="Sakhi Care: High-quality hygiene solutions at accessible prices."
        images={[
          "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1500",
          "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=1500",
          "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1500"
        ]}
      />
      
      {/* Product Highlight */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>Care You Can Trust</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--secondary)', marginTop: '15px' }}>Premium <span className="text-gradient">Quality</span> Products</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '50px' }}>
            {products.map((product, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10 }}
                style={{ 
                  background: 'white', 
                  borderRadius: '40px', 
                  overflow: 'hidden', 
                  boxShadow: '0 30px 70px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f0f0',
                  position: 'relative'
                }}
              >
                {product.tag && (
                  <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--grad-primary)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontWeight: '800', fontSize: '0.75rem', zIndex: 5 }}>
                    {product.tag}
                  </div>
                )}
                <div style={{ height: '350px', overflow: 'hidden' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' }} className="product-img" />
                </div>
                <div style={{ padding: '45px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '5px' }}>{product.name}</h3>
                      <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem' }}>{product.size}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                    <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#bbb' }}>MRP ₹{product.mrp}</span>
                    <div style={{ background: '#FFF5F8', padding: '10px 20px', borderRadius: '15px' }}>
                       <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)' }}>Offer ₹{product.offer}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '1rem', color: '#666', lineHeight: '1.6', marginBottom: '35px' }}>
                    {product.details}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '45px' }}>
                    {product.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#444' }}>
                        <CheckCircle2 size={16} color="var(--primary)" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <a href="https://wa.me/918076611842" className="btn-secondary" style={{ padding: '18px', borderRadius: '15px', justifyContent: 'center' }}>
                      <MessageCircle size={20} /> WhatsApp
                    </a>
                    <a href="tel:8076611842" className="btn-primary" style={{ padding: '18px', borderRadius: '15px', justifyContent: 'center' }}>
                      <Phone size={20} /> Call Now
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="section-padding" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            {[
              { title: "Safe for Skin", desc: "Dermatologically tested to ensure zero irritation and maximum comfort.", icon: ShieldCheck },
              { title: "High Absorbency", desc: "Multi-layer technology that locks in fluid instantly for a dry feel.", icon: Zap },
              { title: "Affordable Care", desc: "Premium hygiene shouldn't be expensive. We keep it reachable.", icon: Heart }
            ].map((item, i) => (
              <motion.div key={i} {...fadeInUp} style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px', color: 'var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <item.icon size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '15px' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Inquiry CTA */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ 
            background: 'var(--secondary)', 
            borderRadius: '50px', 
            padding: '80px', 
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <ShoppingBag size={120} style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }} />
             <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '30px' }}>Bulk Inquiry for NGOs & Distributors</h2>
             <p style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: '700px', margin: '0 auto 50px' }}>
               Partner with us for bulk supplies or distribution opportunities in your region. 
               Let's make quality hygiene products available to every woman.
             </p>
             <Link href="/contact" className="btn-primary" style={{ padding: '20px 60px', fontSize: '1.1rem', background: 'white', color: 'var(--secondary)', borderRadius: '120px' }}>
               Inquiry for Partnership <ArrowRight size={20} style={{ marginLeft: '10px' }} />
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
