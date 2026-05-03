'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Globe, ChevronDown, Activity, Users, BookOpen, Briefcase, Target, Eye, Users2 } from 'lucide-react';
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
        { name: 'Our Team', href: '/team', icon: Users2 },
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
    { name: t('campaign'), href: '/campaign' },
    { name: t('Products'), href: '/products' },
    { name: t('contact'), href: '/contact' },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <Link href="/" className={styles.logo}>
        <img 
          src="/logo.png" 
          alt="SakhiHub Logo" 
          style={{ height: '60px', width: 'auto' }} 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
            if (fallback) (fallback as HTMLElement).style.display = 'block';
          }}
        />
        <div className="logo-fallback" style={{ display: 'none', fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>
          Sakhi<span style={{ color: 'var(--primary)' }}>Hub</span>
        </div>
      </Link>

      <div className={styles.navLinks} style={{ gap: '35px' }}>
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

      <div className={styles.actions} style={{ gap: '15px' }}>
        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #eee', borderRadius: '12px' }}
            onClick={() => setLangOpen(!langOpen)}
          >
            <Globe size={16} />
            <span style={{ fontSize: '0.85rem' }}>{languages.find(l => l.code === language)?.name}</span>
            <ChevronDown size={14} style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
          </button>
          
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  zIndex: 100,
                  width: '150px'
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code as any);
                      setLangOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '0.9rem',
                      background: language === l.code ? '#FFF5F8' : 'white',
                      color: language === l.code ? 'var(--primary)' : 'var(--secondary)',
                      fontWeight: language === l.code ? '700' : '500',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'block'
                    }}
                  >
                    {l.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/login" className="btn-secondary" style={{ padding: '10px 15px', fontSize: '0.85rem', borderRadius: '12px' }}>
          {t('login')}
        </Link>
        <Link href="/register" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem', borderRadius: '120px' }}>
          {t('join_btn')}
        </Link>
        <button className={styles.mobileMenuBtn} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={styles.mobileMenu}
          >
            {navLinks.map((link) => (
              <div key={link.name}>
                <Link
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => !link.subLinks && setIsOpen(false)}
                >
                  {link.name}
                </Link>
                {link.subLinks && (
                  <div style={{ paddingLeft: '20px', marginBottom: '10px' }}>
                    {link.subLinks.map(sub => (
                      <Link 
                        key={sub.name} 
                        href={sub.href} 
                        className={styles.mobileNavLink} 
                        style={{ fontSize: '0.9rem', opacity: 0.8, padding: '8px 0' }}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {languages.map(l => (
                  <button 
                    key={l.code}
                    onClick={() => setLanguage(l.code as any)}
                    style={{ 
                      padding: '8px', 
                      borderRadius: '8px', 
                      background: language === l.code ? 'var(--primary)' : '#f0f0f0',
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
              <Link href="/login" className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                {t('login')}
              </Link>
              <a href="tel:8076611842" className="btn-primary" style={{ justifyContent: 'center', borderRadius: '120px' }}>
                <Phone size={18} />
                <span>8076611842</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
