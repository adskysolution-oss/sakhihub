'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Globe, ChevronDown, Activity, Users, BookOpen, Briefcase, Target, Eye, Users2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
  ];

  const navLinks = [
    { name: t('Home'), href: '/' },
    {
      name: t('about_us'),
      href: '/about',
      subLinks: [
        { name: 'Vision', href: '/vision', icon: Eye },
        { name: 'Mission', href: '/mission', icon: Target },
        // { name: 'Our Team', href: '/team', icon: Users2 },
      ]
    },
    {
      name: t('programs'),
      href: '/programs',
      subLinks: [
        { name: 'Health & Hygiene', href: '/programs/health', icon: Activity },
        { name: 'Employment', href: '/programs/employment', icon: Briefcase },
        { name: 'Education', href: '/programs/education', icon: BookOpen },
        { name: 'Community', href: '/programs/community', icon: Users },
      ]
    },
    { name: t('Projects') || 'Projects', href: '/projects' },
    { name: t('campaign'), href: '/campaign' },
    { name: t('Products'), href: '/products' },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} px-4 md:px-[5%]`}>
      <Link href="/" className={`${styles.logo} scale-90 md:scale-100`}>
        <img
          src="/logo.png"
          alt="SakhiHub Logo"
          className="h-[45px] md:h-[60px] w-auto"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
            if (fallback) (fallback as HTMLElement).style.display = 'block';
          }}
        />
        <div className="logo-fallback text-xl md:text-3xl" style={{ display: 'none', fontWeight: '800', color: 'var(--secondary)' }}>
          Sakhi<span style={{ color: 'var(--primary)' }}>Hub</span>
        </div>
      </Link>

      <div className={`${styles.navLinks} hidden lg:flex`} style={{ gap: '35px' }}>
        {navLinks.map((link) => (
          <div
            key={link.name}
            className={styles.navItemWrapper}
            onMouseEnter={() => link.subLinks && setActiveDropdown(link.name)}
            onMouseLeave={() => setActiveDropdown(null)}
            style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
          >
            <Link
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {link.name}
              {link.subLinks && <ChevronDown size={14} style={{ transform: activeDropdown === link.name ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />}
            </Link>

            <AnimatePresence>
              {link.subLinks && activeDropdown === link.name && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className={styles.dropdown}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '15px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    width: '250px',
                    zIndex: 100,
                    border: '1px solid #f0f0f0'
                  }}
                >
                  {link.subLinks.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={styles.dropdownLink}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 15px',
                        borderRadius: '12px',
                        color: 'var(--secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: '0.2s'
                      }}
                    >
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <sub.icon size={18} />
                      </div>
                      {sub.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className={`${styles.actions} gap-2 md:gap-[15px]`}>
        {/* Language Selector */}
        <div className="relative">
          <button
            className="btn-secondary !p-2 md:!px-3 md:!py-2 flex items-center gap-1.5 border border-gray-100 rounded-xl"
            onClick={() => setLangOpen(!langOpen)}
          >
            <Globe size={16} />
            <span className="text-[10px] md:text-xs font-bold uppercase hidden min-[400px]:block">{languages.find(l => l.code === language)?.name}</span>
            <ChevronDown size={12} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-[100] w-[140px] border border-gray-100"
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setLangOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors ${language === l.code ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-gray-50'}`}
                  >
                    {l.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Member Portal Dropdown */}
        <div
          className={`${styles.portalWrapper}`}
          onMouseEnter={() => setActiveDropdown('portal')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <button className="btn-primary !p-2 md:!px-5 md:!py-2.5 !rounded-xl md:!rounded-full flex items-center gap-2">
            <Users2 size={18} />
            <span className={`${styles.portalText} hidden lg:block text-xs font-bold`}>Member Portal</span>
            <ChevronDown size={14} className={`${styles.portalChevron} hidden lg:block transition-transform duration-300 ${activeDropdown === 'portal' ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {activeDropdown === 'portal' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className={styles.portalDropdown}
              >
                <Link href="/login" className="flex items-center gap-3 p-3 rounded-xl text-secondary hover:bg-primary/5 transition-colors no-underline font-bold text-xs">
                  <Briefcase size={16} className="text-primary" /> {t('login')}
                </Link>
                <Link href="/register" className="flex items-center gap-3 p-3 rounded-xl text-secondary hover:bg-primary/5 transition-colors no-underline font-bold text-xs">
                  <Users size={16} className="text-primary" /> {t('join_btn')}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className={`${styles.mobileMenuBtn} flex lg:hidden`} onClick={() => setIsOpen(!isOpen)} style={{ zIndex: 101 }}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`${styles.mobileMenu} w-[85%] md:w-[400px]`}
          >
            {navLinks.map((link) => (
              <div key={link.name}>
                <Link
                  href={link.href}
                  className={`${styles.mobileNavLink} text-lg md:text-xl`}
                  onClick={() => !link.subLinks && setIsOpen(false)}
                >
                  {link.name}
                </Link>
                {link.subLinks && (
                  <div style={{ paddingLeft: '20px', marginBottom: '10px' }} className="border-l-2 border-primary ml-2">
                    {link.subLinks.map(sub => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={styles.mobileNavLink}
                        style={{ fontSize: '0.9rem', opacity: 0.8, padding: '8px 0', border: 'none' }}
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Language</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code as any)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '12px',
                      background: language === l.code ? 'var(--primary)' : '#f8f9fa',
                      color: language === l.code ? 'white' : 'var(--secondary)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: 'none'
                    }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Link
                  href="/login"
                  className="btn-secondary py-3 px-2"
                  style={{ justifyContent: 'center', fontSize: '0.85rem', borderRadius: '12px' }}
                  onClick={() => setIsOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary py-3 px-2"
                  style={{ justifyContent: 'center', fontSize: '0.85rem', borderRadius: '12px' }}
                  onClick={() => setIsOpen(false)}
                >
                  {t('join_btn')}
                </Link>
              </div>
              <a
                href="mailto:info@sakhihub.com"
                className="btn-primary py-3 px-4"
                style={{
                  justifyContent: 'center',
                  borderRadius: '120px',
                  background: 'var(--secondary)',
                  boxShadow: 'none',
                  fontSize: '0.85rem'
                }}
              >
                <Mail size={16} />
                <span>Email Us</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

