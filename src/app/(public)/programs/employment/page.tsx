'use client';

import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, TrendingUp, Award, Zap, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const EmploymentProgram = () => {
  const { t } = useLanguage();

  const opportunities = [
    {
      title: t('employmentPage.opp1Title'),
      desc: t('employmentPage.opp1Desc'),
      icon: Briefcase,
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=800"
    },
    {
      title: t('employmentPage.opp2Title'),
      desc: t('employmentPage.opp2Desc'),
      icon: GraduationCap,
      img: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800"
    },
    {
      title: t('employmentPage.opp3Title'),
      desc: t('employmentPage.opp3Desc'),
      icon: TrendingUp,
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800"
    }
  ];

  return (
    <main className="overflow-x-hidden">
      <PageBanner 
        title={t('employmentPage.title')} 
        subtitle={t('employmentPage.subtitle')}
        image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1500"
      />

      {/* Career Vision Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
               <div className="rounded-[30px] lg:rounded-[40px] overflow-hidden h-[350px] sm:h-[450px] lg:h-[550px] shadow-2xl shadow-black/10 border-[6px] lg:border-[10px] border-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800" 
                  className="w-full h-full object-cover" 
                  alt="Women working together"
                />
              </div>
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-6 -left-4 sm:top-10 sm:-left-10 bg-white p-5 sm:p-6 rounded-[20px] sm:rounded-[24px] shadow-2xl border border-gray-100 z-20"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Award size={24} />
                   </div>
                   <div>
                      <h4 className="m-0 text-sm sm:text-base font-bold text-secondary">{t('employmentPage.certified')}</h4>
                      <p className="m-0 text-[10px] sm:text-xs text-gray-400 font-medium tracking-wider uppercase">{t('employmentPage.certifiedDesc')}</p>
                   </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 leading-tight">
                {t('employmentPage.pathIndependence').split(' ').slice(0, -1).join(' ')} <span className="text-gradient">{t('employmentPage.pathIndependence').split(' ').slice(-1).join(' ')}</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-10">
                {t('employmentPage.pathIndependenceDesc')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 text-left">
                {[
                  { title: t('employmentPage.stableIncome'), icon: Zap },
                  { title: t('employmentPage.skillCert'), icon: GraduationCap },
                  { title: t('employmentPage.localDeploy'), icon: MapPin },
                  { title: t('employmentPage.growthPathway'), icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-[20px] border border-gray-100/50 hover:border-primary/20 transition-all">
                    <item.icon size={20} className="text-primary shrink-0" />
                    <span className="font-bold text-secondary text-sm sm:text-base">{item.title}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" className="btn-primary py-5 px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform inline-flex">
                {t('employmentPage.applyRole')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pathways Section */}
      <section className="section-padding bg-secondary text-white overflow-hidden">
        <div className="container">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{t('employmentPage.exploreTitle').split(' ').slice(0, -1).join(' ')} <span className="text-primary">{t('employmentPage.exploreTitle').split(' ').slice(-1).join(' ')}</span></h2>
            <p className="opacity-80 mt-4 text-sm sm:text-lg lg:text-xl max-w-2xl mx-auto font-medium">{t('employmentPage.exploreDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {opportunities.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/5 rounded-[40px] p-8 lg:p-10 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 flex flex-col"
              >
                <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/30">
                  <item.icon size={30} className="text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold mb-4">{item.title}</h3>
                <p className="opacity-70 leading-relaxed mb-8 text-sm sm:text-base flex-1 font-medium">{item.desc}</p>
                <Link href="/register" className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group transition-all">
                  {t('employmentPage.getStarted')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Training Impact Stats */}
      <section className="section-padding bg-white">
        <div className="container">
           <div className="bg-gradient-to-br from-primary to-secondary rounded-[40px] lg:rounded-[60px] p-8 sm:p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">{t('employmentPage.statsTitle')}</h2>
                <p className="text-base sm:text-lg lg:text-2xl opacity-90 mb-10 lg:mb-16 font-medium max-w-3xl mx-auto">{t('employmentPage.statsDesc')}</p>
                
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16 justify-center items-center">
                   <div className="flex flex-col items-center">
                      <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">15+</h4>
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80">{t('employmentPage.stat1')}</p>
                   </div>
                   <div className="hidden md:block w-px h-16 bg-white/20"></div>
                   <div className="flex flex-col items-center">
                      <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">₹8k-15k</h4>
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80">{t('employmentPage.stat2')}</p>
                   </div>
                   <div className="hidden md:block w-px h-16 bg-white/20"></div>
                   <div className="flex flex-col items-center">
                      <h4 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">22+</h4>
                      <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-80">{t('employmentPage.stat3')}</p>
                   </div>
                </div>
              </div>
              <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-secondary/30 rounded-full blur-3xl" />
           </div>
        </div>
      </section>
    </main>
  );
};

export default EmploymentProgram;
