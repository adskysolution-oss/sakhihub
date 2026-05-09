'use client';

import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { CheckCircle, Target, Users, MapPin, Package, Heart, Globe, Sparkles, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function CampaignPage() {
  const { t } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      <PageBanner 
        title="Awareness Campaign" 
        subtitle="Bringing health and dignity to the heart of every village."
        images={[
          "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1500",
          "https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500",
          "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1500"
        ]}
      />
      
      {/* High Impact Intro */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeInUp} className="text-center lg:text-left">
              <span className="text-primary font-bold uppercase tracking-[2px] text-xs sm:text-sm">A National Movement</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mt-5 mb-8 leading-tight">
                Breaking Barriers, <span className="text-gradient">Building Health</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                मासिक धर्म स्वच्छता जागरूकता अभियान के तहत SakhiHub गांव-गांव जाकर महिलाओं और बेटियों को period hygiene, sanitary pad use, और infection prevention की जानकारी देता है।
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 text-left max-w-xl mx-auto lg:mx-0">
                {[
                  'Period Hygiene Education',
                  'Infection Prevention',
                  'Safe Disposal Methods',
                  'Health Awareness',
                  'Community Support',
                  'Product Distribution'
                ].map((item) => (
                  <div key={item} className="flex gap-4 items-center text-secondary font-bold text-sm sm:text-base group">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                      <CheckCircle size={16} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="btn-primary py-5 px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform inline-flex">
                Join the Campaign <ArrowRight size={20} className="ml-3" />
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative mt-12 lg:mt-0 order-last lg:order-none"
            >
               <div className="rounded-[40px] lg:rounded-[60px] overflow-hidden h-[300px] sm:h-[450px] lg:h-[550px] shadow-2xl shadow-black/10 border-[6px] lg:border-[10px] border-gray-50">
                <img 
                  src="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=800" 
                  className="w-full h-full object-cover" 
                  alt="Campaign Mission"
                />
              </div>
              <div className="absolute -top-6 -right-4 sm:-top-10 sm:-right-10 bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-2xl border border-gray-100 text-center z-10">
                <Target size={32} className="text-primary mx-auto mb-3" />
                <h4 className="m-0 text-2xl sm:text-3xl font-bold text-secondary">500+</h4>
                <p className="m-0 text-[10px] sm:text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">VILLAGES REACHED</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Field Activities Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary leading-tight">Our <span className="text-gradient">Ground Reality</span></h2>
            <p className="text-gray-500 mt-4 text-sm sm:text-lg lg:text-xl font-medium">How we drive change every single day across rural districts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: "Group Awareness", desc: "Interactive sessions with local women groups to discuss hygiene and health in a safe space.", icon: Users, color: "#E91E63" },
              { title: "Direct Outreach", desc: "Door-to-door awareness and education by our dedicated block employees and field heroes.", icon: MapPin, color: "#6A1B9A" },
              { title: "Product Access", desc: "Ensuring Sakhi Care Pads are reachable to every woman at affordable prices in their own village.", icon: Package, color: "#4CAF50" }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-8 lg:p-12 rounded-[40px] shadow-xl shadow-black/[0.03] border border-gray-100 flex flex-col transition-all"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/[0.02]"
                  style={{ background: `${item.color}10`, color: item.color }}
                >
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-5 leading-tight">{item.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="section-padding bg-secondary text-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
            {[
              { val: '200+', label: 'Block Staff', icon: Users },
              { val: '1.2k+', label: 'Volunteers', icon: Heart },
              { val: '5k+', label: 'Sessions', icon: Activity },
              { val: '100+', label: 'Awards Won', icon: Sparkles },
            ].map((s, i) => (
              <motion.div key={i} {...fadeInUp} className="flex flex-col items-center">
                <div className="text-primary mb-6"><s.icon size={40} className="sm:w-12 sm:h-12" /></div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 tracking-tight">{s.val}</h3>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-white text-center">
        <div className="container">
          <div className="bg-gradient-to-br from-primary to-secondary p-8 sm:p-16 lg:p-24 rounded-[40px] lg:rounded-[60px] text-white relative overflow-hidden shadow-2xl">
            <Globe size={60} className="mx-auto mb-8 opacity-30" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight max-w-4xl mx-auto">Be the Face of Change</h2>
            <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto mb-12 lg:mb-16 font-medium leading-relaxed">
              Whether you are an individual, a NGO, or a government body, let's collaborate to make India hygiene-safe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link href="/register" className="btn-primary py-5 px-10 sm:px-12 text-base sm:text-lg rounded-2xl bg-white text-primary shadow-2xl w-full sm:w-auto hover:scale-105 transition-transform">
                 Join as Volunteer
              </Link>
              <Link href="/contact" className="btn-secondary py-5 px-10 sm:px-12 text-base sm:text-lg rounded-2xl bg-transparent border-2 border-white/40 hover:border-white hover:bg-white/5 w-full sm:w-auto transition-all">
                 Partner with Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

