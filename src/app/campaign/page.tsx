import PageBanner from "@/components/common/PageBanner";
import React from "react";
import { CheckCircle, Target, Users, MapPin, Package } from "lucide-react";
import Link from "next/link";

export default function CampaignPage() {
  return (
    <>
      <PageBanner 
        title="Awareness Campaign" 
        subtitle="मासिक धर्म स्वच्छता जागरूकता अभियान"
        image="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Campaign Objective</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '30px' }}>
                मासिक धर्म स्वच्छता जागरूकता अभियान के तहत SakhiHub गांव-गांव जाकर महिलाओं और बेटियों को period hygiene, sanitary pad use, infection prevention, safe disposal और health awareness की जानकारी देता है।
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  'Period Hygiene Education',
                  'Infection Prevention',
                  'Safe Disposal Methods',
                  'Health Awareness',
                  'Community Support',
                  'Sakhi Care Pads Distribution'
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle size={18} color="var(--primary)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card" style={{ padding: '40px' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Target size={48} color="var(--primary)" style={{ marginBottom: '15px' }} />
                <h3>Our Goal</h3>
                <p>To reach every village in India.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>Villages</span>
                  <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>500+</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <span>Active Workers</span>
                  <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>200+</span>
                </div>
                <Link href="/contact" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                  Join Campaign
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px', color: 'var(--secondary)' }}>Field Activities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
              <Users size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
              <h4>Women Group Awareness</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Interactive sessions with local women groups to discuss hygiene and health.</p>
            </div>
            <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
              <MapPin size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
              <h4>Village Outreach</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Door-to-door awareness and education by our dedicated block employees.</p>
            </div>
            <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
              <Package size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
              <h4>Product Availability</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ensuring Sakhi Care Pads are reachable to every woman at affordable prices.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
