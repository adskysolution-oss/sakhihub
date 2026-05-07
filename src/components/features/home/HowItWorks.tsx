'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const steps = [
  { 
    title: { en: "Awareness", hi: "जागरूकता" }, 
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600", 
    desc: {
      en: "Spreading knowledge about health and hygiene in villages.",
      hi: "गांवों में स्वास्थ्य और स्वच्छता के बारे में ज्ञान फैलाना।"
    }
  },
  { 
    title: { en: "Group", hi: "समूह" }, 
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600", 
    desc: {
      en: "Forming local support networks of empowered women.",
      hi: "सशक्त महिलाओं का स्थानीय सहायता नेटवर्क बनाना।"
    }
  },
  { 
    title: { en: "Training", hi: "प्रशिक्षण" }, 
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600", 
    desc: {
      en: "Providing skills and leadership development sessions.",
      hi: "कौशल और नेतृत्व विकास सत्र प्रदान करना।"
    }
  },
  { 
    title: { en: "Income", hi: "आय" }, 
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600", 
    desc: {
      en: "Creating sustainable local employment opportunities.",
      hi: "स्थायी स्थानीय रोजगार के अवसर पैदा करना।"
    }
  },
  { 
    title: { en: "Growth", hi: "विकास" }, 
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600", 
    desc: {
      en: "Building a self-reliant and confident future together.",
      hi: "मिलकर एक आत्मनिर्भर और आत्मविश्वासी भविष्य का निर्माण करना।"
    }
  }
];

const HowItWorks = () => {
  const { language } = useLanguage();
  
  return (
    <section className="section-padding" style={{ background: '#fff', position: 'relative' }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: 'center', marginBottom: '100px' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {language === 'hi' ? 'हमारी प्रक्रिया' : 'Our Process'}
          </span>
          <h2 style={{ fontSize: '3.5rem', marginTop: '10px' }}>
            {language === 'hi' ? <>यह कैसे <span className="text-gradient">काम करता है</span></> : <>How It <span className="text-gradient">Works</span></>}
          </h2>
        </div>

        <div className="process-flow">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="process-card-wrapper"
              >
                <div className="process-card">
                  <div className="step-number">{i + 1}</div>
                  <div className="image-circle">
                    <img src={step.image} alt={step.title.en} />
                  </div>
                  <h3 className="step-title">{language === 'hi' ? step.title.hi : step.title.en}</h3>
                  <p className="step-desc">{language === 'hi' ? step.desc.hi : step.desc.en}</p>
                </div>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="process-arrow">
                  <ArrowRight size={24} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <style jsx>{`
          .process-flow {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            width: 100%;
          }
          .process-card-wrapper {
            flex: 1;
            position: relative;
          }
          .process-card {
            text-align: center;
            background: white;
            padding: 40px 20px;
            border-radius: 35px;
            transition: 0.4s;
            border: 1px solid #f0f0f0;
            box-shadow: 0 15px 45px rgba(0,0,0,0.05);
            height: 100%;
          }
          .process-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 30px 60px rgba(233, 30, 99, 0.1);
            border-color: var(--primary);
          }
          .image-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto 30px;
            border: 4px solid white;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          .image-circle img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .step-number {
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 40px;
            height: 40px;
            background: var(--grad-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 1.1rem;
            box-shadow: 0 10px 20px rgba(233, 30, 99, 0.3);
            z-index: 10;
          }
          .step-title {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--secondary);
            marginBottom: 15px;
          }
          .step-desc {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.6;
          }
          .process-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 220px;
            color: var(--primary);
            opacity: 0.3;
          }
          @media (max-width: 1100px) {
            .process-flow {
              flex-wrap: wrap;
              justify-content: center;
              gap: 40px;
            }
            .process-card-wrapper {
              flex: 0 0 280px;
            }
            .process-arrow {
              display: none;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default HowItWorks;

