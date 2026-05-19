'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, ShieldCheck, Zap, Globe, 
  ArrowRight, Star, 
  Award, MessageSquareHeart 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const LiveImpactMap = () => {
  const { t } = useLanguage();

  const achievements = [
    { title: t('liveImpact.achievements.trusted.title'), desc: t('liveImpact.achievements.trusted.desc'), icon: Heart },
    { title: t('liveImpact.achievements.safety.title'), desc: t('liveImpact.achievements.safety.desc'), icon: ShieldCheck },
    { title: t('liveImpact.achievements.certified.title'), desc: t('liveImpact.achievements.certified.desc'), icon: Award },
  ];

  return (
    <section className="py-24 md:py-32 bg-[#FCFDFF] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/[0.02] rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* ── Left Side: Mission & Trust ── */}
          <div className="lg:w-[45%] space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white shadow-sm rounded-full border border-gray-50">
                <Globe size={14} className="text-primary animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary/60">{t('liveImpact.tag')}</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-secondary leading-[1.1] tracking-tight">
                {t('liveImpact.title').split(' ').map((word: string, i: number, arr: string[]) => (
                  <span key={i}>
                    {word === 'Trust,' || word === 'Change' || word === 'Trust' ? <span className="text-gradient">{word}</span> : word}{' '}
                  </span>
                ))}
              </h2>
              
              <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
                {t('liveImpact.desc')}
              </p>
            </motion.div>

            <div className="space-y-6">
              {achievements.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-5 p-6 bg-white rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/[0.05] text-primary group-hover:scale-110 transition-transform shrink-0">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-secondary mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-400 font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center lg:justify-start pt-4">
               <button className="px-8 py-4 bg-secondary text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-secondary/20 hover:-translate-y-1 transition-all">
                 {t('liveImpact.cta')} <ArrowRight size={20} />
               </button>
            </div>
          </div>

          {/* ── Right Side: Impact Story & Achievement Panel ── */}
          <div className="lg:w-[55%] w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative bg-white rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-gray-100/50 p-8 md:p-12 overflow-hidden"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-secondary uppercase tracking-tight">{t('liveImpact.storyTitle')}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{t('liveImpact.storySub')}</p>
                  </div>
                  <div className="px-4 py-2 bg-green-50 rounded-2xl flex items-center gap-2">
                    <Star size={14} className="text-green-600 fill-green-600" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t('liveImpact.successBadge')}</span>
                  </div>
                </div>

                {/* Featured Story Card */}
                <div className="relative rounded-[40px] overflow-hidden aspect-[16/10] group">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt="Empowered Woman" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                      <p className="text-white/80 text-xs font-medium mb-2">{t('liveImpact.featuredAuthor') || "Priya Sharma • Patna Hub"}</p>
                      <h4 className="text-xl md:text-2xl font-bold text-white leading-tight">
                        {t('liveImpact.featuredStory')}
                      </h4>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col items-center text-center space-y-3">
                    <MessageSquareHeart size={28} className="text-primary" />
                    <p className="text-xs font-black text-secondary uppercase tracking-widest">{t('liveImpact.communityApproved')}</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col items-center text-center space-y-3">
                    <Zap size={28} className="text-secondary" />
                    <p className="text-xs font-black text-secondary uppercase tracking-widest">{t('liveImpact.fastActivation')}</p>
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">{t('liveImpact.fastActivationDesc')}</p>
                  </div>
                </div>

                {/* Live Activity Ticker (Minimal) */}
                <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                     </div>
                     <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{t('liveImpact.liveUpdates')}</span>
                   </div>
                   <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                         <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                       </div>
                     ))}
                     <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary flex items-center justify-center text-[8px] font-black text-white">+12</div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveImpactMap;
