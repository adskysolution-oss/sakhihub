'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { 
      title: t('howItWorks.steps.1.title'), 
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600", 
      desc: t('howItWorks.steps.1.desc')
    },
    { 
      title: t('howItWorks.steps.2.title'), 
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600", 
      desc: t('howItWorks.steps.2.desc')
    },
    { 
      title: t('howItWorks.steps.3.title'), 
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600", 
      desc: t('howItWorks.steps.3.desc')
    },
    { 
      title: t('howItWorks.steps.4.title'), 
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600", 
      desc: t('howItWorks.steps.4.desc')
    },
    { 
      title: t('howItWorks.steps.5.title'), 
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600", 
      desc: t('howItWorks.steps.5.desc')
    }
  ];

  return (
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm block mb-4">
            {t('howItWorks.tag')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary leading-tight">
            {t('howItWorks.title').split(' ').map((word: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? <span className="text-gradient">{word}</span> : word + ' '}
              </React.Fragment>
            ))}
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
                <div className="bg-white pt-12 pb-8 px-8 md:p-10 rounded-[40px] text-center h-full border border-gray-100 shadow-xl shadow-black/[0.03] transition-all hover:shadow-primary/10 hover:-translate-y-2 group-hover:border-primary/20 relative mt-4 md:mt-0">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-secondary text-white rounded-2xl flex items-center justify-center font-bold text-sm md:text-base shadow-lg shadow-primary/30 z-10 rotate-12 group-hover:rotate-0 transition-transform">
                    {i + 1}
                  </div>
                  
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-8 border-4 border-white shadow-xl shadow-black/10 group-hover:scale-110 transition-transform duration-500">
                    <img src={step.image} className="w-full h-full object-cover" alt={step.title} />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-secondary mb-4">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                    {step.desc}
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
