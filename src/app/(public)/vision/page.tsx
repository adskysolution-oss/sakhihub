import PageBanner from "@/components/ui/PageBanner";
import React from "react";

export default function VisionPage() {
  return (
    <>
      <PageBanner
        title="Our Vision"
        subtitle="Creating a healthy, self-reliant, and respected network of women across India."
        image="/images/Our-Vision.jpeg"
      />

      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>
              Our Vision
            </h2>
            <div className="glass-card" style={{ padding: '60px 40px', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <p>
                SakhiHub&apos;s vision is to connect every woman in India with health, hygiene, self-reliance, and respect.
                We aim to build a powerful women&apos;s network where women from every village can become aware, safe, confident, and economically strong.
              </p>
              <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                Our goal is not just to spread awareness, but to connect women with a better life, better opportunities, and a better future.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
