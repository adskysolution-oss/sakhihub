'use client';

import React from "react";
import { motion } from "framer-motion";
import { Users, Briefcase, Heart, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterBranding() {
  const stats = [
    { number: "50,000+", label: "Women Empowered", icon: Heart },
    { number: "1,200+", label: "Field Heroes", icon: ShieldCheck },
  ];

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-[#2E0249] to-[#570A57] p-8 md:p-12 lg:p-16 text-white flex flex-col justify-between">
      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 opacity-10 z-0">
        <Image 
          src="/assets/register-hero.png" 
          alt="Impact Background" 
          fill
          className="object-cover"
        />
      </div>
      
      {/* Glassmorphic Background Blobs */}
      <div className="absolute -top-10 -left-10 w-64 h-64 md:w-[400px] md:h-[400px] bg-pink-500/15 rounded-full blur-[100px] z-0"></div>
      <div className="absolute bottom-10 -right-5 w-48 h-48 md:w-[300px] md:h-[300px] bg-purple-600/30 rounded-full blur-[80px] z-0"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <Link href="/" className="flex items-center gap-3 mb-10 md:mb-16 no-underline">
          <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Users size={24} className="text-white" />
          </div>
          <span className="text-xl md:text-3xl font-black tracking-tight text-white">SakhiHub</span>
        </Link>

        <div className="inline-flex items-center gap-2.5 px-4 md:px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] md:text-sm font-bold mb-8 border border-white/10">
          <Sparkles size={16} className="text-primary" />
          Real People • Real Impact • Real Trust
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-[3.8rem] font-black leading-[1.1] mb-6 tracking-tighter">
          The Hearts Behind <br />
          <span className="text-gradient brightness-[1.8]">SakhiHub</span>
        </h1>
        
        <p className="text-base md:text-xl opacity-90 leading-relaxed max-w-lg mb-10 text-gray-200">
          Our field team works at the grassroots level, connecting directly with women in villages to build a stronger, independent India.
        </p>

        {/* Feature List */}
        <div className="flex flex-col gap-4 mb-12">
          {['Ground-level Awareness', 'Trust-based Community', 'Verified Growth Network'].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-primary/20 p-1 rounded-full">
                <CheckCircle2 size={18} className="text-primary" />
              </div>
              <span className="font-bold text-sm md:text-lg">{item}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Image & Stats Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="relative z-10 p-2 md:p-5"
      >
        <div className="relative h-44 md:h-60 w-full">
          {/* Main Image Overlay */}
          <div className="absolute left-0 bottom-0 w-40 md:w-72 h-28 md:h-44 rounded-2xl overflow-hidden border-2 md:border-4 border-white/10 shadow-2xl">
            <Image src="/assets/women-group.png" alt="Women Group" fill className="object-cover" />
          </div>

          {/* Secondary Image Overlay */}
          <div className="absolute right-0 top-0 w-28 md:w-52 h-32 md:h-52 rounded-2xl overflow-hidden border-2 md:border-4 border-white/10 shadow-2xl">
            <Image src="/assets/field-work.png" alt="Field Work" fill className="object-cover" />
          </div>

          {/* Floating Stats Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 md:px-6 py-3 md:py-4 rounded-2xl text-[#2E0249] shadow-2xl flex flex-col items-center z-20 min-w-[100px] md:min-w-[140px]">
            <span className="text-lg md:text-2xl font-black text-primary">50k+</span>
            <span className="text-[8px] md:text-[10px] font-black uppercase opacity-60">Active Sakhis</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

