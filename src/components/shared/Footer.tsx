import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageCircle, Globe, Camera, Play, Send, Heart } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-400 pt-16 md:pt-24 pb-12 relative overflow-hidden">
      {/* Newsletter Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 pb-5 md:p-14 bg-gradient-to-br from-primary to-secondary rounded-[40px] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-10 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="text-center lg:text-left flex-1 relative z-10">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">Stay Connected with SakhiHub</h3>
              <p className="text-white/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">Receive updates about our ground-level awareness drives and empowerment programs.</p>
            </div>
            <div className="flex w-full lg:w-auto gap-4 flex-col sm:flex-row relative z-10">
              <input
                type="text"
                placeholder="Mobile or Email"
                className="w-full lg:w-72 px-8 py-5 rounded-2xl bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 font-semibold focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10 text-base"
              />
              <button className="py-5 px-10 bg-white text-secondary rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-xl shadow-black/20 group whitespace-nowrap">
                Subscribe
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="mb-8">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-xl shadow-black/20 hover:scale-105 transition-transform">
                <img src="/logo.png" alt="SakhiHub Logo" className="h-10 w-auto" />
              </div>
            </Link>
            <h4 className="text-xl font-bold text-white mb-6 leading-tight">Empowering Women, <br />Building Futures</h4>
            <p className="text-sm font-medium leading-relaxed opacity-60 mb-8 max-w-xs">
              SakhiHub is a women empowerment platform working for health awareness, education, and self-reliance across India.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Globe size={18} />, link: "#" },
                { icon: <Camera size={18} />, link: "#" },
                { icon: <Play size={18} />, link: "#" },
                { icon: <MessageCircle size={18} />, link: "https://wa.me/918076611842" }
              ].map((social, i) => (
                <a key={i} href={social.link} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5 hover:scale-110 text-white/70">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs font-bold text-primary mb-8 tracking-[3px] uppercase">Quick Links</h3>
            <ul className="flex flex-col gap-4 text-center md:text-left">
              {['About Us', 'Our Mission', 'Programs', 'Gallery', 'Contact Us'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Opportunities */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs font-bold text-primary mb-8 tracking-[3px] uppercase">Join Us</h3>
            <ul className="flex flex-col gap-4 text-center md:text-left">
              {['Block Employee', 'Delivery Partner', 'NGO Partnership', 'Volunteer', 'Start Campaign'].map((link) => (
                <li key={link}>
                  <Link href={`/${link.toLowerCase().replace(' ', '-')}`} className="text-sm font-semibold hover:text-white transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs font-bold text-primary mb-8 tracking-[3px] uppercase">Contact Us</h3>
            <div className="flex flex-col gap-6 w-full max-w-[240px]">
              <a href="tel:8076611842" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary transition-all text-primary group-hover:text-white shrink-0"><Phone size={18} /></div>
                <span className="text-base font-bold text-white group-hover:text-primary transition-colors">8076611842</span>
              </a>
              <a href="https://wa.me/918076611842" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-green-500 transition-all text-green-500 group-hover:text-white shrink-0"><MessageCircle size={18} /></div>
                <span className="text-base font-bold text-white group-hover:text-green-500 transition-colors">WhatsApp Support</span>
              </a>
              <a href="mailto:info@sakhihub.com" className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-all text-blue-500 group-hover:text-white shrink-0"><Mail size={18} /></div>
                <span className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors truncate">info@sakhihub.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 my-16"></div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left">
            <p className="text-xs font-bold tracking-widest opacity-40 uppercase" suppressHydrationWarning>© {new Date().getFullYear()} SakhiHub. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-2 justify-center lg:justify-start">
              <Heart size={12} className="text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Empowering Women & Communities</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
      {/* Background Decorative Heart */}
      <Heart className="absolute -left-20 -bottom-20 w-96 h-96 opacity-5 text-primary transform rotate-12 pointer-events-none" />
    </footer>
  );
};

export default Footer;

