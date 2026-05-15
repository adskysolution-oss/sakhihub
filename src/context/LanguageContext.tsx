'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te'; // Scalable to all Indian languages

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
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
  },
  hi: {
    hero_title: 'महिला सशक्तिकरण, जीवन परिवर्तन',
    hero_subtitle: 'भारत की हर महिला के लिए स्वास्थ्य, स्वच्छता और वित्तीय स्वतंत्रता के लिए समर्पित आंदोलन में शामिल हों।',
    join_btn: 'अभी जुड़ें',
    contact_btn: 'संपर्क करें',
    about_us: 'हमारे बारे में',
    programs: 'कार्यक्रम',
    register: 'पंजीकरण',
    login: 'कर्मचारी लॉगिन',
    impact: 'प्रभाव',
    how_it_works: 'यह कैसे काम करता है',
    why_sakhihub: 'साखीहब क्यों',
    team: 'फील्ड हीरोज',
    Home: 'होम',
    campaign: 'अभियान',
    Projects: 'प्रोजेक्ट्स',
    Products: 'उत्पाद',
    hiring: 'भर्ती',
    contact: 'संपर्क',
    direct_impact: 'सीधा प्रभाव',
    trust_focused: 'विश्वास केंद्रित',
    ground_reality: 'जमीनी हकीकत',
  },
  mr: { hero_title: 'महिला सक्षमीकरण, जीवन परिवर्तन', Home: 'होम', about_us: 'आमच्याबद्दल', join_btn: 'आता सामील व्हा', login: 'कर्मचारी लॉगिन' },
  bn: { hero_title: 'নারী ক্ষমতায়ন, জীবন পরিবর্তন', Home: 'হোম', about_us: 'আমাদের সম্পর্কে', join_btn: 'এখনই যোগ দিন', login: 'কর্মচারী লগইন' },
  ta: { hero_title: 'பெண் सशक्तিকরণ, வாழ்க்கை மாற்றம்', Home: 'முகப்பு', about_us: 'எங்களை பற்றி', join_btn: 'இப்போது சேருங்கள்', login: 'பணியாளர் உள்நுழைவு' },
  te: { hero_title: 'మహిళా సాధికారత, జీవిత మార్పు', Home: 'హోమ్', about_us: 'మా గురించి', join_btn: 'ఇప్పుడే చేరండి', login: 'ఉద్యోగి లాగిన్' },
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

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
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

