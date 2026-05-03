'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Programs', href: '/programs' },
    { name: 'Campaign', href: '/campaign' },
    { name: 'Products', href: '/products' },
    { name: 'Hiring', href: '/hiring' },
    { name: 'Contact', href: '/contact' },
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
        <Link href="/login" className="btn-secondary" style={{ padding: '10px 15px', fontSize: '0.85rem' }}>
          Employee Login
        </Link>
        <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
          Join Now
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
              <Link href="/login" className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                Employee Login
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
