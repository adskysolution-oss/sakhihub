'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Truck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './JoinMovement.module.css';

const joinOptions = [
  {
    title: 'Join Campaign',
    hindi: 'अभियान से जुड़ें',
    desc: 'Become a volunteer and help us spread health awareness in your village.',
    link: '/campaign',
    icon: <Users size={32} />,
    color: 'var(--primary)'
  },
  {
    title: 'Join as Employee',
    hindi: 'नौकरी के लिए आवेदन करें',
    desc: 'Apply for Block Level Employee or District Coordinator roles.',
    link: '/hiring',
    icon: <Briefcase size={32} />,
    color: 'var(--secondary)'
  },
  {
    title: 'Delivery Partner',
    hindi: 'वितरण भागीदार बनें',
    desc: 'Manage product delivery in your Tehsil/Block and earn a steady income.',
    link: '/delivery-partner',
    icon: <Truck size={32} />,
    color: 'var(--primary)'
  }
];

import PosterGenerator from '@/components/ui/PosterGenerator';

const JoinMovement = () => {
  return (
    <section className="section-padding">
      <div className="container">
        <div className="section-title">
          <span>Join the Movement</span>
          <h2>बदलाव का <span className="text-gradient">हिस्सा बनें</span></h2>
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
              <h4 className="hindi">{item.hindi}</h4>
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

