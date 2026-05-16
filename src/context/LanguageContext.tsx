'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te'; // Language state maintained for API/Dynamic content

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Static translations reduced to English only as per project requirement
// All UI labels, buttons, and static text must remain English to serve as source for dynamic translation
const translations: Record<string, string> = {
  hero_title: 'Empowering Women, Transforming Lives',
  hero_subtitle: 'Join the movement dedicated to health, hygiene, and financial independence for every woman in India.',
  join_btn: 'Join Movement',
  contact_btn: 'Contact Us',
  about_us: 'About Us',
  programs: 'Programs',
  register: 'Register',
  login: 'Employee Login',
  impact: 'Impact',
  how_it_works: 'How It Works',
  why_sakhihub: 'Why SakhiHub',
  team: 'Field Heroes',
  Home: 'Home',
  campaign: 'Campaign',
  Projects: 'Projects',
  Products: 'Products',
  hiring: 'Hiring',
  contact: 'Contact',
  direct_impact: 'Direct Impact',
  trust_focused: 'Trust Focused',
  ground_reality: 'Ground Reality',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('sakhihub_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sakhihub_lang', lang);
  };

  // Translation function now always returns English for static keys
  // This ensures the website static UI is English-only while preserving the language state for dynamic content
  const t = (key: string) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
