'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Users, Briefcase, Truck, BookOpen } from 'lucide-react';
import styles from './WhatWeDo.module.css';

const services = [
  {
    title: 'Health Awareness',
    hindi: 'स्वास्थ्य जागरूकता',
    desc: 'Promoting menstrual hygiene and overall women health through community outreach.',
    icon: <Heart size={32} />,
    color: '#FF4D8D'
  },
  {
    title: 'Hygiene Education',
    hindi: 'स्वच्छता शिक्षा',
    desc: 'Providing scientific knowledge about period hygiene and infection prevention.',
    icon: <ShieldCheck size={32} />,
    color: '#6C4AB6'
  },
  {
    title: 'Women Groups',
    hindi: 'महिला समूह',
    desc: 'Creating strong support networks in villages for mutual growth and safety.',
    icon: <Users size={32} />,
    color: '#FF4D8D'
  },
  {
    title: 'Employment',
    hindi: 'रोजगार अवसर',
    desc: 'Generating local jobs for women as block employees and coordinators.',
    icon: <Briefcase size={32} />,
    color: '#6C4AB6'
  },
  {
    title: 'Delivery Network',
    hindi: 'वितरण नेटवर्क',
    icon: <Truck size={32} />,
    desc: 'Building an efficient Tehsil-level delivery partner network across India.',
    color: '#FF4D8D'
  },
  {
    title: 'Skill Training',
    hindi: 'कौशल प्रशिक्षण',
    icon: <BookOpen size={32} />,
    desc: 'Empowering women with vocational skills to achieve economic independence.',
    color: '#6C4AB6'
  }
];

const WhatWeDo = () => {
  return (
    <section className="section-padding" style={{ background: 'var(--bg-light)' }}>
      <div className="container">
        <div className="section-title">
          <span>Our Core Work</span>
          <h2>हमारा कार्य, <span className="text-gradient">हमारी पहचान</span></h2>
          <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)' }}>
            SakhiHub is committed to creating a holistic ecosystem for women's growth and wellbeing.
          </p>
        </div>

        <div className={styles.grid}>
          {services.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={styles.card}
            >
              <div className={styles.iconBox} style={{ background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <h4 className="hindi">{item.hindi}</h4>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
