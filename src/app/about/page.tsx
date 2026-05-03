import PageBannerSlider from "@/components/common/PageBannerSlider";
import React from "react";

export default function AboutPage() {
  const images = [
    "/images/about_mission.png",
    "/images/hero_awareness_campaign.png",
    "/images/team_field.png"
  ];

  return (
    <>
      <PageBannerSlider 
        title="About Us" 
        subtitle="SakhiHub: Empowering Women Across India"
        images={images}
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '30px', textAlign: 'center' }}>
              हमारा परिचय
            </h2>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-main)', lineHeight: '2', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <p>
                <strong>SakhiHub</strong> एक महिला केंद्रित सामाजिक एवं आर्थिक पहल है, जिसका उद्देश्य भारत की हर महिला को स्वास्थ्य, जागरूकता, सम्मान और आत्मनिर्भरता से जोड़ना है।
              </p>
              <p>
                हम ground level पर गांव-गांव तक पहुंच बनाकर महिलाओं को सही जानकारी, आवश्यक उत्पाद और रोजगार के अवसर प्रदान करते हैं।
              </p>
              <p>
                SakhiHub केवल एक platform नहीं, बल्कि महिलाओं के जीवन में सकारात्मक बदलाव लाने वाला movement है।
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Our Values</h3>
              <p style={{ color: 'var(--text-muted)' }}>Trust, Transparency, and Total Empowerment at the grassroots level.</p>
            </div>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Our Approach</h3>
              <p style={{ color: 'var(--text-muted)' }}>Direct community engagement through local female leaders and volunteers.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
