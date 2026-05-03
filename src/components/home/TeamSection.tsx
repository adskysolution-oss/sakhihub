'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Mail, Share2 } from 'lucide-react';

const teamMembers = [
  {
    name: 'Anjali Sharma',
    role: 'Founder & Director',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200',
    bio: 'Dedicated to women empowerment for over 15 years.'
  },
  {
    name: 'Dr. Priya Varma',
    role: 'Health Operations Head',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200',
    bio: 'Expert in rural health hygiene and community wellness.'
  },
  {
    name: 'Rajesh Gupta',
    role: 'Strategy & Growth',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    bio: 'Scaling social impact through technology and innovation.'
  },
  {
    name: 'Meena Devi',
    role: 'Field Coordinator',
    image: 'https://images.unsplash.com/photo-1589386417686-0d34b5903d23?q=80&w=200',
    bio: 'Managing ground operations across 50+ blocks.'
  }
];

const TeamSection = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', marginBottom: '80px' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px' }}>Our Workforce</span>
            <h2 style={{ fontSize: '3rem', marginTop: '10px' }}>The Hearts Behind <span className="text-gradient">SakhiHub</span></h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.1rem', lineHeight: '1.8' }}>
              Our team consists of dedicated professionals, social workers, and ground heroes who work 
              tirelessly to ensure the SakhiHub mission reaches every household. Together, we are 
              building a more equitable and empowered future for women.
            </p>
            <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ fontSize: '2rem', color: 'var(--secondary)' }}>250+</h4>
                <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Field Workers</p>
              </div>
              <div style={{ borderLeft: '1px solid #ddd', paddingLeft: '20px' }}>
                <h4 style={{ fontSize: '2rem', color: 'var(--primary)' }}>15+</h4>
                <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>Districts Covered</p>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ borderRadius: '30px', overflow: 'hidden', boxShadow: 'var(--shadow-hard)' }}
          >
            <img src="/images/team_field.png" alt="Field Team" style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          {teamMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
              style={{ padding: '30px', textAlign: 'center', background: 'white' }}
            >
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 20px', border: '4px solid var(--accent)' }}>
                <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{member.name}</h4>
              <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '15px' }}>{member.role}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>{member.bio}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', color: 'var(--text-muted)' }}>
                <Globe size={18} />
                <Share2 size={18} />
                <Mail size={18} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
