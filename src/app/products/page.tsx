'use client';

import PageBanner from "@/components/common/PageBanner";
import React, { useState } from "react";
import { CheckCircle2, MessageCircle, Phone, Info, ShoppingBag, Star, ShieldCheck, Zap, ArrowRight, Heart, Users, Truck, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { submitLead } from "@/lib/leads";

const products = [
  {
    slug: "regular-pack",
    name: "Sakhi Care Pads - Regular Pack",
    size: "16 Pads (Regular + XL)",
    mrp: 100,
    offer: 80,
    tag: "Most Popular",
    details: "Perfect for daily comfort and high activity days. Features a soft cottony surface for a smooth feel.",
    features: ["Soft Cottony Surface", "Advanced Absorbency", "Anti-Leak Side Walls", "Skin-Safe & Breathable"],
    image: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?q=80&w=800"
  },
  {
    slug: "family-pack",
    name: "Sakhi Care Pads - Family Pack",
    size: "24 Pads (XL + XXL)",
    mrp: 150,
    offer: 120,
    tag: "Best Value",
    details: "All-day and overnight protection for the whole family. Dual-layer technology for zero leakage.",
    features: ["Extra Large Coverage", "Dual-Layer Protection", "Zero Leakage Tech", "Night-Use Optimized", "Eco-Friendly Design"],
    image: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=800"
  }
];

export default function ProductsPage() {
  const [inquiryType, setInquiryType] = useState<'Bulk' | 'Partner' | null>(null);
  const [formData, setFormData] = useState({ name: '', mobile: '', district: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitLead({
        full_name: formData.name,
        mobile: formData.mobile,
        district: formData.district,
        interested_in: inquiryType === 'Bulk' ? 'Bulk Inquiry' : 'NGO',
        message: formData.message
      });
      setSuccess(true);
      setFormData({ name: '', mobile: '', district: '', message: '' });
    } catch (err) {
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
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
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <a href={`https://wa.me/918076611842?text=I'm interested in ordering ${product.name}`} className="btn-secondary" style={{ padding: '18px', borderRadius: '15px', justifyContent: 'center', background: '#25d366', color: 'white', border: 'none' }}>
                      <MessageCircle size={20} /> Order on WhatsApp
                    </a>
                    <Link href={`/products/${product.slug}`} className="btn-primary" style={{ padding: '18px', borderRadius: '15px', justifyContent: 'center' }}>
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners & Bulk Section */}
      <section className="section-padding" style={{ background: '#f8f9fa' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', marginBottom: '80px' }}>
            <div 
              onClick={() => {setInquiryType('Bulk'); setSuccess(false);}}
              style={{ padding: '40px', background: inquiryType === 'Bulk' ? 'var(--secondary)' : 'white', color: inquiryType === 'Bulk' ? 'white' : 'var(--secondary)', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: '0.3s' }}
            >
              <ShoppingBag size={40} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Bulk Inquiry</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '10px' }}>Order in large quantities for hospitals, schools, or distribution.</p>
            </div>
            <div 
              onClick={() => {setInquiryType('Partner'); setSuccess(false);}}
              style={{ padding: '40px', background: inquiryType === 'Partner' ? 'var(--secondary)' : 'white', color: inquiryType === 'Partner' ? 'white' : 'var(--secondary)', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: '0.3s' }}
            >
              <Users size={40} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>NGO Partnership</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '10px' }}>Collaborate with us to reach more women in rural districts.</p>
            </div>
          </div>

          {inquiryType && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '60px', maxWidth: '800px', margin: '0 auto' }}>
              {success ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={60} color="#25d366" style={{ margin: '0 auto 20px' }} />
                  <h3 style={{ color: 'var(--secondary)' }}>Inquiry Received!</h3>
                  <p style={{ color: '#666' }}>Our partnership team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'grid', gap: '25px' }}>
                  <h3 style={{ color: 'var(--secondary)', fontWeight: '900', fontSize: '2rem' }}>{inquiryType === 'Bulk' ? 'Bulk Order Inquiry' : 'NGO Partnership Form'}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Full Name / Organization" style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee' }} />
                    <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} type="tel" placeholder="Mobile Number" style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee' }} />
                  </div>
                  <input required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} type="text" placeholder="District & State" style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee' }} />
                  <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Additional details..." rows={4} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #eee' }} />
                  <button disabled={loading} type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '18px' }}>
                    {loading ? "Submitting..." : "Submit Inquiry"}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', textAlign: 'center' }}>
            {[
              { val: "1M+", label: "Pads Distributed", icon: Truck },
              { val: "100%", label: "Skin Friendly", icon: ShieldCheck },
              { val: "500+", label: "Village Partners", icon: Users }
            ].map((s, i) => (
              <div key={i}>
                <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><s.icon size={45} /></div>
                <h3 style={{ fontSize: '3rem', fontWeight: '900' }}>{s.val}</h3>
                <p style={{ opacity: 0.7, fontWeight: '700' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

