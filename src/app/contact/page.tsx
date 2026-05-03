import PageBanner from "@/components/common/PageBanner";
import React from "react";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <PageBanner 
        title="Contact Us" 
        subtitle="Get in Touch with SakhiHub"
        image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '60px' }}>
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
              <h3 style={{ marginBottom: '30px', color: 'var(--secondary)' }}>Send a Message</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
                    <input type="text" placeholder="Your Name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number</label>
                    <input type="tel" placeholder="Your Number" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>District</label>
                    <input type="text" placeholder="Your District" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Interested In</label>
                    <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                      <option>Campaign</option>
                      <option>Hiring</option>
                      <option>Delivery Partner</option>
                      <option>Product</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Message</label>
                  <textarea placeholder="Tell us more..." rows={5} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
                </div>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
