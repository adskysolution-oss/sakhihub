import PageBanner from "@/components/common/PageBanner";
import React from "react";
import { Heart, Shield, BookOpen, Briefcase, Zap, Brain } from "lucide-react";
import Link from "next/link";

const programsData = [
  {
    title: "Menstrual Hygiene Awareness",
    hindi: "मासिक धर्म स्वच्छता जागरूकता",
    icon: <Heart size={40} />,
    desc: "गांव-गांव जाकर महिलाओं और बेटियों को period hygiene की जानकारी देना।",
  },
  {
    title: "Women Health & Hygiene",
    hindi: "महिला स्वास्थ्य एवं स्वच्छता",
    icon: <Shield size={40} />,
    desc: "स्वच्छता और स्वास्थ्य के प्रति जागरूकता और आवश्यक उत्पादों की उपलब्धता।",
  },
  {
    title: "Women Empowerment",
    hindi: "महिला सशक्तिकरण",
    icon: <Zap size={40} />,
    desc: "महिलाओं को उनके अधिकारों और समाज में उनकी भूमिका के प्रति सशक्त बनाना।",
  },
  {
    title: "Education & Skill Development",
    hindi: "शिक्षा एवं कौशल विकास",
    icon: <BookOpen size={40} />,
    desc: "तकनीकी और व्यवहारिक कौशल सिखाकर आत्मनिर्भर बनाना।",
  },
  {
    title: "Employment & Self-Reliance",
    hindi: "रोजगार एवं आत्मनिर्भरता",
    icon: <Briefcase size={40} />,
    desc: "स्थानीय स्तर पर रोजगार के अवसर प्रदान करना।",
  },
  {
    title: "Health, Nutrition & Mental Health",
    hindi: "स्वास्थ्य, पोषण और मानसिक स्वास्थ्य",
    icon: <Brain size={40} />,
    desc: "शारीरिक और मानसिक स्वास्थ्य के लिए विशेष सत्र और सहायता।",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <PageBanner 
        title="Our Programs" 
        subtitle="Our Initiatives for Change"
        image="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {programsData.map((prog, index) => (
              <div key={index} className="glass-card" style={{ padding: '40px', textAlign: 'center', transition: 'all 0.3s ease' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--accent)', color: 'var(--primary)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                  {prog.icon}
                </div>
                <h3 style={{ color: 'var(--secondary)', marginBottom: '10px', fontSize: '1.4rem' }}>{prog.hindi}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '15px', fontSize: '0.9rem' }}>{prog.title}</p>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{prog.desc}</p>
                <Link href={`/programs/${index}`} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
