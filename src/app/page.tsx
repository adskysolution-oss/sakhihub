import Hero from "@/components/home/Hero";
import Impact from "@/components/home/Impact";
import ProgramsPreview from "@/components/home/ProgramsPreview";
import ProductShowcase from "@/components/home/ProductShowcase";
import { ArrowRight, MessageSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      
      <section className="section-padding" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>About SakhiHub</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '30px' }}>
                SakhiHub एक महिला केंद्रित सामाजिक एवं आर्थिक पहल है, जिसका उद्देश्य भारत की हर महिला को स्वास्थ्य, जागरूकता, सम्मान और आत्मनिर्भरता से जोड़ना है। हम ground level पर गांव-गांव तक पहुंच बनाकर महिलाओं को सही जानकारी, आवश्यक उत्पाद और रोजगार के अवसर प्रदान करते हैं।
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'var(--accent)', borderRadius: '12px', color: 'var(--primary)' }}>
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--secondary)' }}>Professional & Trustworthy</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>We build semi-official channels for grassroots empowerment.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', background: 'var(--accent)', borderRadius: '12px', color: 'var(--primary)' }}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--secondary)' }}>Direct Support</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Accessible via WhatsApp and call for every woman.</p>
                  </div>
                </div>
              </div>
              <Link href="/about" className="btn-secondary" style={{ marginTop: '40px' }}>
                Read Our Story
                <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1000&auto=format&fit=crop" 
                alt="Women Group" 
                style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}
              />
            </div>
          </div>
        </div>
      </section>

      <Impact />
      <ProgramsPreview />
      <ProductShowcase />

      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Why SakhiHub?</h2>
          <p style={{ maxWidth: '800px', margin: '0 auto 60px', color: 'var(--text-muted)' }}>
            SakhiHub केवल एक platform नहीं, बल्कि महिलाओं के जीवन में सकारात्मक बदलाव लाने वाला movement है।
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Awareness</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Breaking taboos around menstrual hygiene and women's health through education.</p>
            </div>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Accessibility</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Bringing high-quality sanitary products to the doorstep of every rural household.</p>
            </div>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Self-Reliance</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Creating local employment opportunities for women as block employees and partners.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--secondary)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Join the Movement</h2>
          <p style={{ marginBottom: '40px', opacity: 0.9 }}>Be a part of India's largest women empowerment network.</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="btn-primary" style={{ border: '2px solid white' }}>
              Become a Volunteer
            </Link>
            <Link href="/hiring" className="btn-secondary" style={{ background: 'white', color: 'var(--secondary)' }}>
              Apply for Job
            </Link>
            <Link href="/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
