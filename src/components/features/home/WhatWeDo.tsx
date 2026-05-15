'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const services = [
  { 
    hi: "स्वास्थ्य जागरूकता", 
    en: "Health Awareness", 
    desc: {
      hi: "जागरूकता अभियानों के माध्यम से मासिक धर्म स्वच्छता और समग्र महिला स्वास्थ्य को बढ़ावा देना।",
      en: "Promoting menstrual hygiene and overall women health through awareness campaigns."
    },
    points: {
      hi: ["मासिक धर्म जागरूकता", "स्वास्थ्य शिक्षा", "ग्रामीण पहुंच"],
      en: ["Period awareness", "Health education", "Village outreach"]
    },
    image: "/images/Health-Awareness.jpeg",
    color: "#E91E63"
  },
  { 
    hi: "स्वच्छता शिक्षा", 
    en: "Hygiene Education", 
    desc: {
      hi: "स्वच्छता और संक्रमण की रोकथाम के बारे में वैज्ञानिक ज्ञान प्रदान करना।",
      en: "Providing scientific knowledge about hygiene, sanitation, and infection prevention."
    },
    points: {
      hi: ["स्वच्छ आदतें", "स्वच्छता जागरूकता", "स्वास्थ्य सुरक्षा"],
      en: ["Clean habits", "Sanitation awareness", "Health safety"]
    },
    image: "/images/Hygiene-Education.jpeg",
    color: "#6A1B9A"
  },
  { 
    hi: "महिला समूह", 
    en: "Women Groups", 
    desc: {
      hi: "सहायता, सुरक्षा और विकास के लिए मजबूत स्थानीय महिला नेटवर्क बनाना।",
      en: "Creating strong local women networks for support, safety, and growth."
    },
    points: {
      hi: ["समूह गठन", "नेतृत्व", "सामुदायिक शक्ति"],
      en: ["Group formation", "Leadership", "Community strength"]
    },
    image: "/images/Women-Groups.jpeg",
    color: "#FF9800"
  },
  { 
    hi: "रोजगार अवसर", 
    en: "Employment", 
    desc: {
      hi: "ब्लॉक और ग्राम स्तर पर महिलाओं के लिए स्थानीय रोजगार के अवसर पैदा करना।",
      en: "Generating local job opportunities for women at block and village level."
    },
    points: {
      hi: ["फील्ड नौकरियां", "स्थानीय कमाई", "करियर विकास"],
      en: ["Field jobs", "Local earning", "Career growth"]
    },
    image: "/images/Employment.jpeg",
    color: "#4CAF50"
  }
];

const WhatWeDo = () => {
  const { language, t } = useLanguage();
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <section className="py-16 md:py-32 bg-[#fcfcfc] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-16 md:mb-24 text-center">
          <span className="text-primary font-bold uppercase tracking-[2px] text-xs md:text-sm block mb-4">
            {language === 'hi' ? 'हमारा मुख्य कार्य' : 'OUR CORE WORK'}
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-secondary">
            {language === 'hi' ? <>कर्म के माध्यम से <span className="text-gradient">सशक्तिकरण</span></> : <>Empowering Through <span className="text-gradient">Action</span></>}
          </h2>
          <p className="text-gray-500 mt-6 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            {language === 'hi' 
              ? 'साखीहब जागरूकता पैदा करने, समुदायों का निर्माण करने और बेहतर भविष्य के लिए महिलाओं को सशक्त बनाने के लिए जमीनी स्तर पर काम करता है।'
              : 'SakhiHub works at ground level to create awareness, build communities, and empower women for a better future.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {services.map((item, idx) => (
            <motion.div 
              key={idx} 
              {...fadeInUp}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 flex flex-col transition-all hover:shadow-primary/5"
            >
              <div className="relative h-56 md:h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
                  alt={language === 'hi' ? item.hi : item.en} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 md:opacity-40"></div>
                <div className="absolute bottom-6 left-6">
                   <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest">
                     {language === 'hi' ? 'विशेषता' : 'Core Service'}
                   </div>
                </div>
              </div>
              <div className="p-8 md:p-10 flex-1 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-secondary leading-tight">
                  {language === 'hi' ? item.hi : item.en}
                </h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 flex-1">
                  {language === 'hi' ? item.desc.hi : item.desc.en}
                </p>
                
                <div className="mb-8 space-y-3">
                  {(language === 'hi' ? item.points.hi : item.points.en).map((point, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] md:text-xs font-bold text-secondary uppercase tracking-wider">
                      <CheckCircle size={14} className="shrink-0" style={{ color: item.color }} /> {point}
                    </div>
                  ))}
                </div>

                <Link href="/programs" className="flex items-center gap-2 font-bold text-xs md:text-sm uppercase tracking-widest transition-all hover:gap-4" style={{ color: item.color }}>
                  {language === 'hi' ? 'अधिक जानें' : 'Learn More'} <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;

