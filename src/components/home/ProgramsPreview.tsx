'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, BookOpen, Briefcase, Truck } from 'lucide-react';
import styles from './ProgramsPreview.module.css';

const programs = [
  {
    title: 'Health & Hygiene Awareness',
    hindi: 'मासिक धर्म स्वच्छता जागरूकता',
    icon: <Heart size={32} />,
    color: '#FF4D8D',
  },
  {
    title: 'Women Empowerment',
    hindi: 'महिला सशक्तिकरण',
    icon: <Shield size={32} />,
    color: '#6C4AB6',
  },
  {
    title: 'Skill Development',
    hindi: 'शिक्षा एवं कौशल विकास',
    icon: <BookOpen size={32} />,
    color: '#FF4D8D',
  },
  {
    title: 'Employment Opportunities',
    hindi: 'रोजगार एवं आत्मनिर्भरता',
    icon: <Briefcase size={32} />,
    color: '#6C4AB6',
  },
  {
    title: 'Delivery Partner Network',
    hindi: 'वितरण नेटवर्क',
    icon: <Truck size={32} />,
    color: '#FF4D8D',
  },
];

const ProgramsPreview = () => {
  return (
    <section className={styles.programs}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>What We Do</span>
          <h2>Our Core Programs</h2>
          <p>Ground-level initiatives to drive positive change in women's lives.</p>
        </div>

        <div className={styles.grid}>
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={styles.card}
            >
              <div className={styles.iconBox} style={{ background: program.color }}>
                {program.icon}
              </div>
              <h3>{program.hindi}</h3>
              <p>{program.title}</p>
              <div className={styles.hoverContent}>
                <span>Learn More</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsPreview;
