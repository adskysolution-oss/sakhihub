import PageBanner from "@/components/ui/PageBanner";
import React from "react";

export default function VisionPage() {
  return (
    <>
      <PageBanner 
        title="Our Vision" 
        subtitle="हमारा विज़न"
        image="https://images.unsplash.com/photo-1573497019236-17f8177b81e8?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>
              हमारा विज़न
            </h2>
            <div className="glass-card" style={{ padding: '60px 40px', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <p>
                हमारा विज़न एक ऐसा भारत बनाना है जहां हर महिला स्वस्थ, जागरूक, सुरक्षित, सम्मानित और आर्थिक रूप से आत्मनिर्भर हो।
              </p>
              <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                SakhiHub का लक्ष्य देश के हर जिले, हर block और हर गांव तक एक मजबूत महिला नेटवर्क बनाना है।
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

