'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const FloatingSupport = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5, type: 'spring' }}
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100]"
    >
      <Link href="/contact" className="group flex items-center gap-3">
        {/* Expanded Label on Hover */}
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-gray-100 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 pointer-events-none hidden md:block">
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] whitespace-nowrap">Need Help? <span className="text-primary">Contact Us</span></p>
        </div>

        {/* Main Icon Circle */}
        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/30 group-hover:scale-110 active:scale-95 transition-all relative">
          <Mail size={24} className="group-hover:hidden" />
          <MessageCircle size={24} className="hidden group-hover:block animate-pulse" />
          
          {/* Notification Dot */}
          <span className="absolute top-0 right-0 w-4 h-4 bg-amber-400 border-2 border-white rounded-full"></span>
        </div>
      </Link>
    </motion.div>
  );
};

export default FloatingSupport;
