'use client';

import PageBanner from "@/components/common/PageBanner";
import React, { useState } from "react";
import { Briefcase, IndianRupee, MapPin, CheckCircle, ArrowRight } from "lucide-react";

export default function HiringPage() {
  const [activeTab, setActiveTab] = useState('block');

  return (
    <>
      <PageBanner 
        title="Join Our Team" 
        subtitle="Opportunities for Women Empowerment"
        image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Current Openings</h2>
            <div style={{ display: 'inline-flex', background: 'var(--bg-light)', padding: '8px', borderRadius: '50px', gap: '10px' }}>
              <button 
                onClick={() => setActiveTab('block')}
                style={{ 
                  padding: '12px 25px', 
                  borderRadius: '50px', 
                  background: activeTab === 'block' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'block' ? 'white' : 'var(--text-muted)',
                  fontWeight: '600'
                }}
              >
                Block Level Employee
              </button>
              <button 
                onClick={() => setActiveTab('district')}
                style={{ 
                  padding: '12px 25px', 
                  borderRadius: '50px', 
                  background: activeTab === 'district' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'district' ? 'white' : 'var(--text-muted)',
                  fontWeight: '600'
                }}
              >
                District Coordinator
              </button>
            </div>
          </div>

          <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px' }}>
            {activeTab === 'block' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                <div>
                  <h3 style={{ color: 'var(--secondary)', fontSize: '1.8rem', marginBottom: '15px' }}>Block Level Female Employee</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '25px' }}>
                    <IndianRupee size={24} />
                    <span>₹16,000 + ₹3,000 Petrol</span>
                  </div>
                  <h4 style={{ marginBottom: '15px' }}>Key Responsibilities:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> गांव-गांव जाकर awareness देना</li>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> महिलाओं के group बनाना</li>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> Period hygiene awareness देना</li>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> Daily reporting</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-light)', borderRadius: '24px', padding: '40px' }}>
                  <MapPin size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                  <h4 style={{ marginBottom: '20px' }}>Work Location</h4>
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Assigned Block in your District</p>
                  <a href="https://forms.gle/oX8yX4UgUMmVvp8J9" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Apply on Google Form
                    <ArrowRight size={18} />
                  </a>
                  <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>OR <a href="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register on Website</a></p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                <div>
                  <h3 style={{ color: 'var(--secondary)', fontSize: '1.8rem', marginBottom: '15px' }}>District Coordinator Female</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem', marginBottom: '25px' }}>
                    <IndianRupee size={24} />
                    <span>₹22,000 + ₹3,000 Petrol</span>
                  </div>
                  <h4 style={{ marginBottom: '15px' }}>Key Responsibilities:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> Block team manage करना</li>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> 5–10 block visit करना</li>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> Field monitoring</li>
                    <li style={{ display: 'flex', gap: '10px' }}><CheckCircle size={18} color="var(--primary)" /> Daily online meeting & reports</li>
                  </ul>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-light)', borderRadius: '24px', padding: '40px' }}>
                  <Briefcase size={48} color="var(--secondary)" style={{ marginBottom: '20px' }} />
                  <h4 style={{ marginBottom: '20px' }}>Leadership Role</h4>
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Managing district-wide operations</p>
                  <a href="https://forms.gle/oX8yX4UgUMmVvp8J9" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    Apply for Coordinator
                    <ArrowRight size={18} />
                  </a>
                  <p style={{ marginTop: '15px', fontSize: '0.8rem' }}>OR <a href="/register" style={{ color: 'var(--secondary)', fontWeight: '600' }}>Register on Website</a></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
