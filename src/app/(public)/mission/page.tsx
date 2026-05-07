import PageBanner from "@/components/ui/PageBanner";
import React from "react";

export default function MissionPage() {
  return (
    <>
      <PageBanner 
        title="Our Mission" 
        subtitle="हमारा मिशन"
        image="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>
              हमारा मिशन
            </h2>
            <div className="glass-card" style={{ padding: '60px 40px', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '2' }}>
              <p>
                हमारा मिशन है कि भारत की हर महिला को सही स्वास्थ्य जानकारी, मासिक धर्म स्वच्छता जागरूकता, सुरक्षित और सुलभ sanitary products, रोजगार के अवसर और आत्मनिर्भर बनने का मार्ग मिले।
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

