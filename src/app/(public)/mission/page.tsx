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
            <div className="glass-card" style={{ padding: '60px 40px', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <p>
                SakhiHub का मिशन महिलाओं तक सही स्वास्थ्य जानकारी, Period Hygiene Awareness, सुरक्षित sanitary products, skill support और रोजगार के अवसर पहुँचाना है।
                हम गांव-गांव जाकर Women Groups, Awareness Campaigns, Training Programs और Micro Industry Initiatives के माध्यम से महिलाओं को आत्मनिर्भर बनाने का कार्य कर रहे हैं।
              </p>
              <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                हमारा उद्देश्य हर Block और हर Tehsil तक पहुँचकर एक स्वस्थ, जागरूक और सशक्त भारत का निर्माण करना है।
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

