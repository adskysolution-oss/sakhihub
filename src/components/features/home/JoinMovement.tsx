'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './JoinMovement.module.css';
import PosterGenerator from '@/components/ui/PosterGenerator';

const joinOptions = [
  {
    title: 'Join Campaign',
    desc: 'Become a volunteer and help us spread health awareness in your village.',
    link: '/campaign',
    icon: <Users size={32} />,
    color: 'var(--primary)'
  },
  {
    title: 'Join as Employee',
    desc: 'Apply for Block Level Employee or District Coordinator roles.',
    link: '/hiring',
    icon: <Briefcase size={32} />,
    color: 'var(--secondary)'
  },
  {
    title: 'Delivery Partner',
    desc: 'Manage product delivery in your Tehsil/Block and earn a steady income.',
    link: '/delivery-partner',
    icon: <Truck size={32} />,
    color: 'var(--primary)'
  }
];

const JoinMovement = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title">
          <span>Join the Movement</span>
          <h2>Be the <span className="text-gradient">Change</span></h2>
        </div>

        <div className={styles.grid}>
          {joinOptions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={styles.card}
              style={{ '--accent-color': item.color } as any}
            >
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <Link href={item.link} className={styles.link}>
                Get Started <ArrowRight size={18} />
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: '100px' }}>
          <PosterGenerator />
        </div>
      </div>
    </section>
  );
};

export default JoinMovement;
