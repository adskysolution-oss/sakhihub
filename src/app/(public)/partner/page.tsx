import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { Handshake, Target, Users, School, Home, MessageSquare } from "lucide-react";

export default function PartnerPage() {
  return (
    <>
      <PageBanner 
        title="Partner With Us" 
        subtitle="Collaboration for Social Impact"
        image="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Who Can Partner With Us?</h2>
            <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)' }}>We collaborate with organizations that share our vision of an empowered India.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '80px' }}>
            {[
              { name: 'NGOs', icon: Target },
              { name: 'SHGs', icon: Users },
              { name: 'Schools', icon: School },
              { name: 'Colleges', icon: School },
              { name: 'Distributors', icon: Home },
              { name: 'Social Orgs', icon: Handshake },
            ].map(item => (
              <div key={item.name} className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                  <item.icon size={40} />
                </div>
                <h4 style={{ color: 'var(--secondary)' }}>{item.name}</h4>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ marginBottom: '30px', color: 'var(--secondary)' }}>Collaboration Areas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><MessageSquare size={20} /></div>
                  <div>
                    <h5 style={{ color: 'var(--text-main)' }}>Awareness Camps</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Organizing menstrual hygiene sessions in rural areas.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><Users size={20} /></div>
                  <div>
                    <h5 style={{ color: 'var(--text-main)' }}>Skill Training</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Collaborative workshops for vocational skill building.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><Home size={20} /></div>
                  <div>
                    <h5 style={{ color: 'var(--text-main)' }}>Community Outreach</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expanding the network to reach the last mile.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gradient" style={{ marginBottom: '20px' }}>Inquiry Form</h3>
              <form className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input type="text" placeholder="Organization Name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="text" placeholder="Contact Person" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="tel" placeholder="Mobile Number" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                  <option>Interested In: Awareness Camps</option>
                  <option>Interested In: Distribution</option>
                  <option>Interested In: Skill Training</option>
                </select>
                <textarea placeholder="Message" rows={4} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Send Inquiry</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

