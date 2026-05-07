'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CreditCard, ShieldCheck, Headphones } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    title: 'Join as Employee',
    desc: 'Work with us and empower women in your community.',
    points: ['Attractive Salary', 'Incentives', 'Growth Opportunities'],
    btnText: 'Apply Now',
    href: '/hiring',
    icon: <Briefcase size={32} />,
    color: 'var(--primary)',
    image: '/images/team_field.png'
  },
  {
    title: 'Easy Membership',
    desc: 'Join with a simple ₹100 membership and enjoy exclusive benefits.',
    btnText: 'Join Now',
    href: '/register',
    icon: <CreditCard size={32} />,
    color: 'var(--secondary)',
    image: '/images/about_mission.png'
  },
  {
    title: 'Secure Payments',
    desc: 'Make secure payments online easily through UPI, Cards & Wallets.',
    btnText: 'Pay Now',
    href: '/payment',
    icon: <ShieldCheck size={32} />,
    color: 'var(--primary)',
    image: '/images/hero_awareness_campaign.png'
  },
  {
    title: 'We Are Here to Help You',
    desc: 'Our support team is always ready to assist you.',
    points: ['1800-123-4567', 'support@sakhihub.in'],
    btnText: 'Contact Us',
    href: '/contact',
    icon: <Headphones size={32} />,
    color: 'var(--secondary)',
    image: '/images/team_core.png'
  }
];

const HomeActionGrid = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {actions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card"
              style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ flex: '0.4', position: 'relative' }}>
                  <img src={action.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={action.title} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, transparent, rgba(0,0,0,0.5))` }}></div>
                </div>
                <div style={{ flex: '0.6', padding: '30px', background: action.color, color: 'white' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{action.title}</h3>
                  <p style={{ fontSize: '0.85rem', opacity: '0.9', marginBottom: '20px' }}>{action.desc}</p>
                  
                  {action.points && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '0.8rem' }}>
                      {action.points.map(p => (
                        <li key={p} style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                           • {p}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link href={action.href} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', border: '1px solid white' }}>
                    {action.btnText}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeActionGrid;

