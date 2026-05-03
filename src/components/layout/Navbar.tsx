'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
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
    { name: t('about_us'), href: '/about' },
    { name: t('programs'), href: '/programs' },
    { name: t('campaign'), href: '/campaign' },
    { name: t('Products'), href: '/products' },
    { name: t('hiring'), href: '/hiring' },
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

      <div className={styles.navLinks}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className={styles.actions}>
        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn-secondary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #eee' }}
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

        <Link href="/login" className="btn-secondary" style={{ padding: '10px 15px', fontSize: '0.85rem' }}>
          {t('login')}
        </Link>
        <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
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
              <Link
                key={link.name}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
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
              <a href="tel:8076611842" className="btn-primary" style={{ justifyContent: 'center' }}>
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
