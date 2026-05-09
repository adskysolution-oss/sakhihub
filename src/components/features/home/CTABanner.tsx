'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const CTABanner = () => {
  const { t, language } = useLanguage();

  return (
    <section className="section-padding !pb-0 overflow-hidden">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-secondary-dark rounded-[40px] md:rounded-[60px] py-16 px-6 md:py-24 md:px-20 text-center text-white relative overflow-hidden shadow-2xl"
        >
          {/* Background Decor */}
          <div className="absolute top-[-100px] right-[-100px] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px]" />
          <div className="absolute bottom-[-100px] left-[-100px] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-secondary/30 rounded-full blur-[80px] md:blur-[120px]" />

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 relative z-10"
          >
            {language === 'hi' ? (
              <>आज ही जुड़ें और बदलाव का <span className="text-primary">हिस्सा बनें</span></>
            ) : (
              <>Join Today & <span className="text-primary">Be the Change</span></>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg lg:text-xl opacity-90 max-w-3xl mx-auto mb-12 leading-relaxed font-medium relative z-10"
          >
            {language === 'hi' 
              ? "आज ही साखीहब से जुड़ें और अपने समुदाय को सशक्त बनाएं। आपके द्वारा उठाया गया हर कदम भारत भर में महिलाओं के जीवन पर स्थायी प्रभाव डालता है।"
              : "Join SakhiHub today and empower your community. Every step you take creates a lasting impact on women's lives across India. Join the movement now!"
            }
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center relative z-10"
          >
            <Link href="/register" className="btn-primary bg-white text-secondary py-5 px-10 text-base md:text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all">
              {t('join_btn')} <ArrowRight size={20} />
            </Link>
            <Link href="https://wa.me/918076611842" target="_blank" className="btn-secondary border-white/20 text-white bg-white/5 backdrop-blur-sm py-5 px-10 text-base md:text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <MessageCircle size={20} />
              {language === 'hi' ? 'व्हाट्सएप पूछताछ' : 'WhatsApp Inquiry'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;

