'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Globe, Camera, Play, Heart, Search, ShieldCheck, PhoneCall } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Footer = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [verifyId, setVerifyId] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyId.trim()) {
      router.push(`/verify/${encodeURIComponent(verifyId.trim())}`);
    }
  };

  return (
    <footer className="bg-slate-900 text-gray-400 pt-16 md:pt-24 pb-12 relative overflow-hidden">
      <div className="container mx-auto px-8 md:px-12 pt-12 lg:pt-0 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 md:gap-y-16">
          {/* Column 1: Brand */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="mb-8">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-xl shadow-black/20 hover:scale-105 transition-transform">
                <img src="/logo.png" alt="SakhiHub Logo" className="h-10 w-auto" />
              </div>
            </Link>
            <h4 className="text-xl font-bold text-white mb-6 leading-tight">
              {t('footer.heading').split('\n').map((part: string, idx: number) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx === 0 && <br />}
                </React.Fragment>
              ))}
            </h4>
            <p className="text-sm font-medium leading-relaxed opacity-60 mb-8 max-w-xs mx-auto lg:mx-0">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Globe size={18} />, link: "#" },
                { icon: <Camera size={18} />, link: "#" },
                { icon: <Play size={18} />, link: "#" },
              ].map((social, i) => (
                <a key={i} href={social.link} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/5 hover:scale-110 text-white/70">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-span-1 flex flex-col items-start">
            <h3 className="text-[10px] font-bold text-primary mb-8 tracking-[3px] uppercase opacity-80">{t('footer.quickLinks')}</h3>
            <ul className="flex flex-col gap-5">
              {[
                { name: t('footer.about'), href: '/about' },
                { name: t('footer.ourMission'), href: '/mission' },
                { name: t('footer.programsLink'), href: '/programs' },
                // { name: t('footer.gallery'), href: '/gallery' },
                { name: t('footer.contact'), href: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Join Us */}
          <div className="col-span-1 flex flex-col items-start">
            <h3 className="text-[10px] font-bold text-primary mb-8 tracking-[3px] uppercase opacity-80">{t('footer.joinUs')}</h3>
            <ul className="flex flex-col gap-5">
              {[
                { name: t('footer.currentOpenings'), href: '/careers' },
                { name: t('footer.blockEmployee'), href: '/hiring' },
                { name: t('footer.deliveryPartner'), href: '/delivery-partner' },
                { name: t('footer.ngoPartnership'), href: '/partner' },
                { name: t('footer.volunteer'), href: '/register' },
                // { name: t('footer.startCampaign'), href: '/campaign' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal & Support */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-start pt-8 lg:pt-0 border-t lg:border-none border-white/5 w-full">
            <h3 className="text-[10px] font-bold text-primary mb-8 tracking-[3px] uppercase opacity-80">{t('footer.legalSupport')}</h3>
            <ul className="flex flex-col gap-5 mb-8">
              <li><Link href="/privacy-policy" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link></li>
              <li><Link href="/terms-and-conditions" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">{t('footer.termsConditions')}</Link></li>
              <li><Link href="/refund-policy" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">{t('footer.refundPolicy')}</Link></li>
            </ul>
            <div className="flex flex-col gap-6 w-full max-w-[280px]">
              <a href="mailto:info@sakhihub.com" className="flex items-center gap-4 group justify-start">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-500 transition-all text-blue-500 group-hover:text-white shrink-0"><Mail size={18} /></div>
                <span className="text-sm font-semibold text-white group-hover:text-blue-500 transition-colors truncate">info@sakhihub.com</span>
              </a>
              <a href="tel:+918062179122" className="flex items-center gap-4 group justify-start">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-green-500 transition-all text-green-500 group-hover:text-white shrink-0"><PhoneCall size={18} /></div>
                <span className="text-sm font-semibold text-white group-hover:text-green-500 transition-colors truncate">+91 8062179122</span>
              </a>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 my-16"></div>

        {/* Verification Section */}
        <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-6 md:p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Verify SakhiHub Identity</h3>
              <p className="text-sm text-gray-400 mt-1">Enter a Mobile No, Employee ID, Vendor Code, or Member ID to verify their official status.</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="w-full max-w-md flex gap-2 mt-4 md:mt-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Enter ID..."
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shrink-0"
            >
              Verify
            </button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="text-center lg:text-left text-[10px] font-bold tracking-widest uppercase">
            <p className="opacity-40" suppressHydrationWarning>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            <div className="flex items-center gap-2 mt-2 justify-center lg:justify-start">
              <Heart size={12} className="text-primary" />
              <p className="text-white/20">{t('footer.empowering')}</p>
            </div>
            <p className="opacity-40 mt-2 leading-relaxed">
              {t('footer.proprietorship')}
            </p>
          </div>
        </div>
      </div>
      {/* Background Decorative Heart */}
      <Heart className="absolute -left-20 -bottom-20 w-96 h-96 opacity-5 text-primary transform rotate-12 pointer-events-none" />
    </footer>
  );
};

export default Footer;
