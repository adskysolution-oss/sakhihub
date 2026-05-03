import PageBanner from "@/components/common/PageBanner";
import React from "react";
import { CheckCircle2, MessageCircle, Phone, Info } from "lucide-react";
import Link from "next/link";

const products = [
  {
    name: "Sakhi Care Pads - Regular Pack",
    size: "16 Pads",
    mrp: 100,
    offer: 80,
    details: "Regular + XL, Day Use",
    features: ["Soft & Comfortable", "High Absorbency", "Leak Protection", "Skin Friendly"],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800"
  },
  {
    name: "Sakhi Care Pads - Family Pack",
    size: "24 Pads",
    mrp: 150,
    offer: 120,
    details: "XL + XXL, Day & Night Protection",
    features: ["Extra Protection", "High Absorbency", "Leak Protection", "Skin Friendly", "Night Use"],
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=801"
  }
];

export default function ProductsPage() {
  return (
    <>
      <PageBanner 
        title="Our Products" 
        subtitle="Sakhi Care Pads - Quality & Hygiene"
        image="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            {products.map((product, idx) => (
              <div key={idx} className="glass-card" style={{ overflow: 'hidden' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                <div style={{ padding: '30px' }}>
                  <h3 style={{ color: 'var(--secondary)', marginBottom: '5px' }}>{product.name}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '15px' }}>{product.size}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <span style={{ textDecoration: 'line-through', color: '#999' }}>MRP ₹{product.mrp}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>Offer ₹{product.offer}</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'var(--bg-light)', padding: '8px 12px', borderRadius: '8px', marginBottom: '20px' }}>
                    <Info size={14} style={{ marginRight: '5px' }} />
                    {product.details}
                  </p>

                  <div style={{ marginBottom: '30px' }}>
                    {product.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="var(--primary)" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="https://wa.me/918076611842" className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                      <MessageCircle size={18} />
                      WhatsApp
                    </a>
                    <a href="tel:8076611842" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                      <Phone size={18} />
                      Call Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Bulk Inquiry for NGOs/Distributors</h2>
          <p style={{ marginBottom: '30px' }}>If you are looking for bulk supply or distribution partnership, please contact us directly.</p>
          <Link href="/partner" className="btn-secondary">
            Partnership Inquiry
          </Link>
        </div>
      </section>
    </>
  );
}
