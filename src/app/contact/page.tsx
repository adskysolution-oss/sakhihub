'use client';

import PageBanner from "@/components/common/PageBanner";
import React, { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Send, CheckCircle2 } from "lucide-react";
import { submitLead } from "@/lib/leads";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    district: '',
    interestedIn: 'General',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitLead({
        full_name: formData.fullName,
        mobile: formData.mobile,
        district: formData.district,
        interested_in: formData.interestedIn as any,
        message: formData.message
      });
      setSuccess(true);
      setFormData({ fullName: '', mobile: '', district: '', interestedIn: 'General', message: '' });
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBanner 
        title="Contact Us" 
        subtitle="Get in Touch with SakhiHub"
        image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px' }}>
            <div>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Reach Out to Us</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Have questions about our programs, products, or opportunities? We are here to help.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--accent)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--secondary)', marginBottom: '2px' }}>Call Us</h5>
                    <p style={{ fontWeight: '700' }}>8076611842</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: '#e1ffeb', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25d366' }}>
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--secondary)', marginBottom: '2px' }}>WhatsApp</h5>
                    <p style={{ fontWeight: '700' }}>8076611842</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--accent)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--secondary)', marginBottom: '2px' }}>Email</h5>
                    <p style={{ fontWeight: '700' }}>info@sakhihub.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--accent)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h5 style={{ color: 'var(--secondary)', marginBottom: '2px' }}>Office</h5>
                    <p style={{ fontWeight: '700' }}>Regional Outreach Center, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '50px' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ width: '80px', height: '80px', background: '#e1ffeb', color: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. Our team will contact you shortly.</p>
                  <button onClick={() => setSuccess(false)} className="btn-primary" style={{ marginTop: '30px' }}>Send Another</button>
                </div>
              ) : (
                <>
                  <h3 style={{ marginBottom: '30px', color: 'var(--secondary)' }}>Send a Message</h3>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
                        <input required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} type="text" placeholder="Your Name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number</label>
                        <input required value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} type="tel" placeholder="Your Number" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>District</label>
                        <input value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} type="text" placeholder="Your District" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Interested In</label>
                        <select value={formData.interestedIn} onChange={(e) => setFormData({...formData, interestedIn: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                          <option value="General">General Inquiry</option>
                          <option value="Campaign">Campaign</option>
                          <option value="Employee">Hiring</option>
                          <option value="Delivery">Delivery Partner</option>
                          <option value="Bulk Inquiry">Product Bulk Inquiry</option>
                          <option value="NGO">NGO Partnership</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Message</label>
                      <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Tell us more..." rows={5} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
                    </div>
                    <button disabled={loading} type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
                      {loading ? "Sending..." : "Send Message"} <Send size={18} style={{ marginLeft: '10px' }} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

