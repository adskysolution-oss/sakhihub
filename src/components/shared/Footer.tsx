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
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="32" height="32" className="transition-all duration-200">
                      <circle cx="12" cy="12" r="11.8" fill="#FFFFFF"/>
                      <path d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z" fill="#1877F2"/>
                    </svg>
                  ),
                  link: "https://www.facebook.com/share/1EvQerKLxo/"
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="32" height="32" className="transition-all duration-200">
                      <circle cx="12" cy="12" r="11.5" fill="#25D366"/>
                      <path transform="translate(-1.52, 2.39)" d="M20.52 3.449A9.61 9.61 0 0 0 13.52 0a9.61 9.61 0 0 0-9.52 9.52 9.61 9.61 0 0 0 1.48 5.08L3.52 20.48l6.04-1.58a9.61 9.61 0 0 0 3.96.82h.02a9.61 9.61 0 0 0 9.61-9.61 9.61 9.61 0 0 0-7.02-9.27zM13.52 18.36h-.02a7.96 7.96 0 0 1-4.04-1.12l-.28-.16-2.92.76.78-2.82-.18-.3a7.96 7.96 0 0 1-1.22-4.24 7.96 7.96 0 0 1 7.96-7.96 7.96 7.96 0 0 1 7.96 7.96 7.96 7.96 0 0 1-7.96 7.96zm4.36-6.04c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.36-1.92-1.18-.7-.62-1.18-1.4-1.32-1.64-.14-.24-.02-.38.1-.5.12-.12.28-.32.42-.48.14-.16.18-.28.28-.48.1-.2.04-.36-.02-.5-.06-.14-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42h-.46a.9.9 0 0 0-.64.3c-.22.24-.86.84-.86 2.06s.88 2.4 1 2.56c.12.16 1.66 2.54 4.02 3.56.56.24 1.02.38 1.38.48.58.18 1.1.16 1.52.1.48-.06 1.48-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.46-.28z" fill="#FFFFFF"/>
                    </svg>
                  ),
                  link: "https://wa.me/919111806787"
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" width="32" height="32" className="transition-all duration-200">
                      <defs>
                        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#fdf497" />
                          <stop offset="5%" stopColor="#fdf497" />
                          <stop offset="45%" stopColor="#fd5949" />
                          <stop offset="60%" stopColor="#d6249f" />
                          <stop offset="90%" stopColor="#285AEB" />
                        </linearGradient>
                      </defs>
                      <rect width="24" height="24" rx="5.5" fill="url(#instagram-gradient)"/>
                      <path transform="translate(2.4, 2.4) scale(0.8)" d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" fill="#FFFFFF"/>
                    </svg>
                  ),
                  link: "https://www.instagram.com/sakhihubofficial"
                },
              ].map((social, i) => (
                <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-120 hover:brightness-110 drop-shadow-md">
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
                suppressHydrationWarning
                type="text"
                placeholder="Enter ID..."
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                required
              />
            </div>
            <button
              suppressHydrationWarning
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
          </div>
        </div>
      </div>
      {/* Background Decorative Heart */}
      <Heart className="absolute -left-20 -bottom-20 w-96 h-96 opacity-5 text-primary transform rotate-12 pointer-events-none" />
    </footer>
  );
};

export default Footer;
