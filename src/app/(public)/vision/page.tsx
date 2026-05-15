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
                SakhiHub का विज़न भारत की हर महिला को स्वास्थ्य, स्वच्छता, आत्मनिर्भरता और सम्मान से जोड़ना है।
                हम एक ऐसा सशक्त महिला नेटवर्क बनाना चाहते हैं जहाँ गांव-गांव की महिलाएँ जागरूक, सुरक्षित, आत्मविश्वासी और आर्थिक रूप से मजबूत बन सकें।
              </p>
              <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                हमारा लक्ष्य केवल Awareness फैलाना नहीं, बल्कि महिलाओं को बेहतर जीवन, बेहतर अवसर और बेहतर भविष्य से जोड़ना है।
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

