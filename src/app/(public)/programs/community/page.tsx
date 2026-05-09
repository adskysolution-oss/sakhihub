'use client';

import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { motion } from 'framer-motion';
import { Users, Heart, Share2, ShieldCheck, Globe, CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const CommunityProgram = () => {
  return (
    <main className="overflow-x-hidden">
      <PageBanner 
        title="Community Network" 
        subtitle="Building a powerful sisterhood where every woman supports another."
        image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1500"
      />

      {/* Connection Vision */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             <div className="relative order-2 lg:order-1">
                <div className="rounded-[30px] lg:rounded-[40px] overflow-hidden h-[350px] sm:h-[450px] lg:h-[550px] shadow-2xl shadow-black/10">
                  <img 
                    src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=800" 
                    className="w-full h-full object-cover" 
                    alt="Women holding hands"
                  />
                </div>
                <div className="absolute top-1/2 -left-4 sm:-left-10 -translate-y-1/2 bg-gradient-to-br from-primary to-secondary p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] text-white border-[4px] sm:border-[8px] border-white shadow-2xl z-20">
                   <Share2 size={32} className="sm:w-10 sm:h-10" />
                </div>
             </div>

             <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="order-1 lg:order-2 text-center lg:text-left"
             >
               <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 leading-tight">
                 Strength in <span className="text-gradient">Unity</span>
               </h2>
               <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                 Alone we are strong, but together we are unstoppable. SakhiHub creates local village groups 
                 where women can share resources, advice, and emotional support.
               </p>

               <div className="grid gap-6 mb-10 text-left max-w-xl mx-auto lg:mx-0">
                  {[
                    { title: "Local Village Groups", desc: "Dedicated groups for every block to ensure no woman is left behind." },
                    { title: "Peer Support System", desc: "A safe space for sharing personal and professional challenges." },
                    { title: "Group Savings & Micro-aid", desc: "Financial assistance through community-led small savings." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 group">
                       <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                          <CheckCircle2 size={20} />
                       </div>
                       <div>
                          <h4 className="text-lg sm:text-xl font-bold text-secondary mb-1">{item.title}</h4>
                          <p className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Network Scale */}
      <section className="section-padding bg-gray-50">
        <div className="container">
           <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary leading-tight">A Growing <span className="text-gradient">Brotherhood</span></h2>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                { label: 'Village Groups', val: '500+', icon: Users },
                { label: 'Active Sakhis', val: '50k+', icon: Heart },
                { label: 'Success Stories', val: '1,200+', icon: ShieldCheck },
                { label: 'Total Reach', val: '100k+', icon: Globe },
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white rounded-[32px] text-center shadow-xl shadow-black/[0.02] border border-gray-100 transition-all hover:shadow-primary/10 hover:-translate-y-2">
                   <div className="text-primary mb-5 flex justify-center"><item.icon size={40} /></div>
                   <h3 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">{item.val}</h3>
                   <p className="text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Join the Network CTA */}
      <section className="section-padding bg-secondary text-white text-center relative overflow-hidden">
        <div className="container relative z-10">
           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight">Don't Walk <span className="text-primary">Alone</span></h2>
           <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto mb-12 lg:mb-16 font-medium leading-relaxed">
             Join the largest network of rural women in India. Be part of a group that understands you, supports you, and grows with you.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
             <Link href="/register" className="btn-primary py-5 px-10 sm:px-12 text-base sm:text-lg rounded-2xl shadow-xl w-full sm:w-auto hover:scale-105 transition-transform">
                Create Village Group
             </Link>
             <Link href="/contact" className="btn-secondary py-5 px-10 sm:px-12 text-base sm:text-lg rounded-2xl bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/5 w-full sm:w-auto transition-all">
                Find My Group
             </Link>
           </div>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>
    </main>
  );
};

export default CommunityProgram;

