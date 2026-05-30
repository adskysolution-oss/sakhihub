'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import en from '@/locales/en/common.json';
import hi from '@/locales/hi/common.json';
import mr from '@/locales/mr/common.json';
import bn from '@/locales/bn/common.json';
import ta from '@/locales/ta/common.json';
import te from '@/locales/te/common.json';
import gu from '@/locales/gu/common.json';
import kn from '@/locales/kn/common.json';
import ml from '@/locales/ml/common.json';
import pa from '@/locales/pa/common.json';
import or from '@/locales/or/common.json';

type Language = 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te' | 'gu' | 'kn' | 'ml' | 'pa' | 'or';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, arg2?: string | Record<string, string | number>, arg3?: Record<string, string | number>) => any;
}

const allTranslations: Record<Language, any> = {
  en,
  hi,
  mr,
  bn,
  ta,
  te,
  gu,
  kn,
  ml,
  pa,
  or,
};

const oldKeysMap: Record<string, string> = {
  hero_title: 'hero.title',
  hero_subtitle: 'hero.subtitle',
  join_btn: 'hero.joinBtn',
  contact_btn: 'ctaBanner.contactBtn',
  about_us: 'nav.aboutUs',
  programs: 'nav.programs',
  register: 'nav.joinMovement',
  login: 'nav.employeeLogin',
  impact: 'hero.impactStatus',
  how_it_works: 'howItWorks.title',
  why_sakhihub: 'whySakhi.title',
  team: 'team.voicesTitle',
  Home: 'nav.home',
  campaign: 'hero.tagline',
  Projects: 'nav.projects',
  Products: 'nav.products',
  hiring: 'nav.joinMovement',
  contact: 'nav.contact',
  direct_impact: 'whySakhi.cards.reach.title',
  trust_focused: 'whySakhi.cards.transparent.title',
  ground_reality: 'team.voicesTitle',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('sakhihub_lang') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Sync html lang attribute and axios interceptor
  useEffect(() => {
    document.documentElement.lang = language;
    axios.defaults.headers.common['x-language'] = language;
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sakhihub_lang', lang);
  };

  // Reusable translation system with nested key support and fallback to English
  const t = (key: string, arg2?: string | Record<string, string | number>, arg3?: Record<string, string | number>) => {
    let defaultValue = key;
    let replacements: Record<string, string | number> | undefined = undefined;

    if (typeof arg2 === 'string') {
      defaultValue = arg2;
      replacements = arg3;
    } else if (typeof arg2 === 'object') {
      replacements = arg2 as Record<string, string | number>;
    }

    const resolvedKey = oldKeysMap[key] || key;
    const keys = resolvedKey.split('.');
    
    let value: any = allTranslations[language];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English
        let fallbackVal: any = allTranslations['en'];
        for (const fk of keys) {
          if (fallbackVal && fallbackVal[fk] !== undefined) {
            fallbackVal = fallbackVal[fk];
          } else {
            fallbackVal = null;
            break;
          }
        }
        value = fallbackVal || defaultValue;
        break;
      }
    }

    if (typeof value === 'string' && replacements) {
      let result = value;
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{\\{?${k}\\}\\}?`, 'g'), String(v));
      });
      return result;
    }

    return value;
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

