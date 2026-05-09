'use client';

import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Activity, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HealthProgram = () => {
  const initiatives = [
    {
      title: "Sanitary Pad Distribution",
      desc: "Providing high-quality, eco-friendly sanitary pads to women in rural and urban areas to ensure menstrual health.",
      icon: ShieldCheck,
      img: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800"
    },
    {
      title: "Health Awareness Camps",
      desc: "Regular workshops and camps led by medical professionals to educate women on wellness, nutrition, and hygiene.",
      icon: Activity,
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800"
    },
    {
      title: "Village Health Committees",
      desc: "Forming local committees to monitor and support the health needs of the community at the grassroots level.",
      icon: Users,
      img: "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800"
    }
  ];

  return (
    <main className="overflow-x-hidden">
      <PageBanner 
        title="Health & Hygiene" 
        subtitle="Dedicated to promoting wellness and menstrual dignity for every woman in India."
        image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1500"
      />

      {/* Intro Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 leading-tight">
                Why Menstrual Health <span className="text-gradient">Matters</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-8">
                In many parts of India, health and hygiene remain a challenge due to lack of awareness and accessibility. 
                SakhiHub is on a mission to break the silence and provide tangible solutions.
              </p>
              <ul className="list-none p-0 grid gap-4 text-left max-w-xl mx-auto lg:mx-0">
                {[
                  "Reducing school dropouts due to lack of sanitary products",
                  "Preventing infections and serious health issues",
                  "Empowering women to talk about their health openly",
                  "Building a network of village health volunteers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm sm:text-base lg:text-lg font-semibold text-secondary">
                    <CheckCircle2 size={20} className="text-primary shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <div className="relative mt-12 lg:mt-0">
              <div className="rounded-[30px] lg:rounded-[40px] overflow-hidden h-[300px] sm:h-[400px] lg:h-[500px] shadow-2xl shadow-black/10">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800" 
                  className="w-full h-full object-cover" 
                  alt="Women Health Awareness"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 bg-gradient-to-br from-primary to-secondary p-6 sm:p-8 rounded-[24px] sm:rounded-[30px] color-white text-white max-w-[180px] sm:max-w-[250px] shadow-2xl">
                <h4 className="text-2xl sm:text-3xl font-bold mb-1">85%</h4>
                <p className="text-[10px] sm:text-sm m-0 opacity-90 leading-tight font-medium">Improvement in local health awareness in SakhiHub villages.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary leading-tight">Our Core <span className="text-gradient">Initiatives</span></h2>
            <p className="text-gray-500 mt-4 text-sm sm:text-lg lg:text-xl font-medium">Practical solutions on the ground for real impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {initiatives.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 flex flex-col transition-all"
              >
                <div className="h-48 sm:h-56 lg:h-60 overflow-hidden">
                  <img src={item.img} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt={item.title} />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-6">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-4">{item.title}</h3>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 flex-1">{item.desc}</p>
                  <Link href="/contact" className="text-primary font-bold text-sm uppercase tracking-widest flex items-center gap-2 group transition-all">
                    Learn More <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-secondary text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight">Ready to Make a <span className="text-primary">Difference?</span></h2>
          <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto mb-10 lg:mb-12 leading-relaxed font-medium">
            Whether you want to support our health camps or need products in your village, we are here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link href="/register" className="btn-primary py-5 px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform">
              Join the Movement
            </Link>
            <Link href="/contact" className="btn-secondary py-5 px-10 text-base sm:text-lg rounded-2xl bg-transparent border-2 border-white/30 hover:border-white hover:bg-white/5 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HealthProgram;

