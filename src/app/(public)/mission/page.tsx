import PageBanner from "@/components/ui/PageBanner";
import React from "react";

export default function MissionPage() {
  return (
    <>
      <PageBanner
        title="Our Mission"
        subtitle="Empowering women through information, health products, and skill development."
        image="/images/Our-Mission.jpeg"
      />

      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>
              Our Mission
            </h2>
            <div className="glass-card" style={{ padding: '60px 40px', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <p>
                SakhiHub&apos;s mission is to provide women with accurate health information, period hygiene awareness, safe sanitary products, skill support, and employment opportunities.
                We work village to village through women&apos;s groups, awareness campaigns, training programs, and micro-industry initiatives to make women self-reliant.
              </p>
              <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                Our objective is to reach every block and tehsil, building a healthy, aware, and empowered India.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
