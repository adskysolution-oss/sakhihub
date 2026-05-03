'use client';

import { motion } from 'framer-motion';
import { Users, Shield, Target, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const stories = [
  { 
    name: "Sunita Devi", 
    role: "Village Member", 
    story: "SakhiHub se judne ke baad mujhe swachhta aur health ki sahi jankari mili aur aaj main apne gaon me awareness phaila rahi hu.",
    image: "/images/campaign_sanitary.png"
  },
  { 
    name: "Rekha Bai", 
    role: "Field Volunteer", 
    story: "Main ghar ghar jaakar mahilao ko samjhati hu aur ab main khud financially independent ho chuki hu.",
    image: "/images/campaign_health.png"
  },
  { 
    name: "Pooja Sharma", 
    role: "Group Leader", 
    story: "Humne apne gaon me mahila group banaya aur ab sab milkar kaam karte hain aur earn bhi karte hain.",
    image: "/images/about_mission.png"
  },
  { 
    name: "Meena Kumari", 
    role: "Team Leader", 
    story: "Main chahti hu ki hamare zila ki har mahila apne pairo par khadi ho aur SakhiHub isme puri madad kar raha hai.",
    image: "/images/team_field.png"
  }
];

const TeamSection = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="section-padding">
      <div className="container">
        {/* Hearts Behind SakhiHub */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '80px', alignItems: 'center', marginBottom: '100px' }}>
          <motion.div {...fadeInUp}>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Our Workforce</span>
            <h2 style={{ fontSize: '3.5rem', marginTop: '15px', color: 'var(--secondary)', lineHeight: '1.1' }}>The Hearts Behind <span className="text-gradient">SakhiHub</span></h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.8', marginTop: '30px', maxWidth: '550px' }}>
              Our field team works at the grassroots level, connecting directly with women in villages and communities. 
              They conduct awareness sessions, build groups, and help women become confident, independent, and empowered.
            </p>
            
            <div style={{ marginTop: '40px', marginBottom: '50px' }}>
              {['Ground-level outreach in villages', 'Direct connection with women', 'Real impact through awareness'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', fontSize: '1.05rem', fontWeight: '600', color: 'var(--secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(233, 30, 99, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={14} />
                  </div>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { val: '250+', label: 'Field Workers' },
                { val: '15+', label: 'Districts Covered' },
                { val: '50k+', label: 'Women Connected' }
              ].map((stat, idx) => (
                <div key={idx} style={{ padding: '20px', background: '#FFF5F8', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(233, 30, 99, 0.1)' }}>
                  <h4 style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: '900', lineHeight: '1' }}>{stat.val}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '700' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeInUp} style={{ position: 'relative' }}>
            <div style={{ 
              position: 'relative', 
              zIndex: 2, 
              borderRadius: '24px', 
              overflow: 'hidden', 
              boxShadow: '0 30px 60px rgba(0,0,0,0.15)'
            }}>
              <img src="/images/team_field.png" style={{ width: '100%', height: '550px', objectFit: 'cover' }} alt="Field Team" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(106, 27, 154, 0.4), transparent)' }}></div>
            </div>
            
            {/* Floating Overlays */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '150px', borderRadius: '18px', overflow: 'hidden', border: '6px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 3 }}
            >
              <img src="/images/hero_awareness_campaign.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            </motion.div>
          </motion.div>
        </div>

        {/* Real Impact Stories */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>REAL VOICES</span>
          <h2 style={{ fontSize: '3rem', marginTop: '10px' }}>Voices of <span className="text-gradient">Real Change</span></h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {stories.map((item, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              style={{ 
                background: 'white', 
                borderRadius: '24px', 
                padding: '40px 30px', 
                textAlign: 'center', 
                boxShadow: '0 15px 40px rgba(0,0,0,0.05)',
                border: '1px solid rgba(233, 30, 99, 0.1)'
              }}
            >
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                margin: '0 auto 25px',
                border: '4px solid #FFF5F8',
                boxShadow: '0 10px 20px rgba(233, 30, 99, 0.15)'
              }}>
                <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '5px' }}>{item.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '20px' }}>{item.role}</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{item.story}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
