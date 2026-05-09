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
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm block mb-4">
            {language === 'hi' ? 'हमारी प्रक्रिया' : 'Our Process'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary leading-tight">
            {language === 'hi' ? <>यह कैसे <span className="text-gradient">काम करता है</span></> : <>How It <span className="text-gradient">Works</span></>}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-4">
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex-1 relative group"
              >
                <div className="bg-white p-8 md:p-10 rounded-[40px] text-center h-full border border-gray-100 shadow-xl shadow-black/[0.03] transition-all hover:shadow-primary/10 hover:-translate-y-2 group-hover:border-primary/20">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/30 z-10">
                    {i + 1}
                  </div>
                  
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-8 border-4 border-white shadow-xl shadow-black/10 group-hover:scale-110 transition-transform duration-500">
                    <img src={step.image} className="w-full h-full object-cover" alt={step.title.en} />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                    {language === 'hi' ? step.title.hi : step.title.en}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                    {language === 'hi' ? step.desc.hi : step.desc.en}
                  </p>
                </div>
              </motion.div>
              
              {i < steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-primary/20">
                  <ArrowRight size={24} className="animate-pulse" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

