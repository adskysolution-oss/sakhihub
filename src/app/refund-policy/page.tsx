'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function RefundPolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
            <RefreshCw size={14} className="text-primary" /> {t('refundPolicy.financialClarity')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            {t('refundPolicy.title').split(' ').slice(0, -1).join(' ')} <span className="text-primary">{t('refundPolicy.title').split(' ').slice(-1).join(' ')}</span>
          </h1>
          <p className="text-white/60 font-bold max-w-2xl mx-auto uppercase tracking-widest text-xs">{t('refundPolicy.lastUpdated')}</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-12">
              <p className="text-secondary font-bold leading-relaxed mb-0">
                {t('refundPolicy.intro')}
              </p>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">01</span>
                {t('refundPolicy.noReturnTitle', 'Return Policy & Delivery')}
              </h2>
              <ul className="list-disc pl-6 space-y-3 text-gray-600 font-semibold leading-relaxed">
                <li>{t('refundPolicy.noReturnText', 'We have no return policy.')}</li>
                <li>{t('refundPolicy.deliveryTimeText', 'Products will be delivered within 5-7 Days.')}</li>
              </ul>
            </section>

            <div className="space-y-12 text-gray-600">
              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">02</span>
                  {t('refundPolicy.sec1Title')}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t('refundPolicy.sec1Desc')}
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>{t('refundPolicy.sec1L1').split(':')[0]}:</strong>{t('refundPolicy.sec1L1').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('refundPolicy.sec1L2').split(':')[0]}:</strong>{t('refundPolicy.sec1L2').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('refundPolicy.sec1L3').split(':')[0]}:</strong>{t('refundPolicy.sec1L3').split(':').slice(1).join(':')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">03</span>
                  {t('refundPolicy.sec2Title')}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t('refundPolicy.sec2Desc')}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>{t('refundPolicy.sec2L1').split(':')[0]}:</strong>{t('refundPolicy.sec2L1').split(':').slice(1).join(':')}</li>
                  <li><strong>{t('refundPolicy.sec2L2').split(':')[0]}:</strong>{t('refundPolicy.sec2L2').split(':').slice(1).join(':')}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">04</span>
                  {t('refundPolicy.sec3Title')}
                </h2>
                <p className="leading-relaxed">
                  {t('refundPolicy.sec3Desc')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">05</span>
                  {t('refundPolicy.sec4Title')}
                </h2>
                <p className="leading-relaxed">
                  {t('refundPolicy.sec4Desc')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">07</span>
                  {t('refundPolicy.sec5Title')}
                </h2>
                <p className="leading-relaxed mb-4">
                  {t('refundPolicy.sec5Desc')}
                </p>
                <ol className="list-decimal pl-6 space-y-2 mt-4">
                  <li>{t('refundPolicy.sec5L1')}</li>
                  <li>{t('refundPolicy.sec5L2')}</li>
                  <li>{t('refundPolicy.sec5L3')}</li>
                  <li>{t('refundPolicy.sec5L4')}</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">07</span>
                  {t('refundPolicy.sec6Title')}
                </h2>
                <p className="leading-relaxed">
                  {t('refundPolicy.sec6Desc')}
                </p>
              </section>
            </div>

            <div className="mt-16 p-10 bg-secondary rounded-[40px] text-white text-center">
              <h3 className="text-2xl font-black mb-4">{t('refundPolicy.issuesTitle')}</h3>
              <p className="text-white/60 mb-8 font-bold text-sm">{t('refundPolicy.issuesDesc')}</p>
              <a href="mailto:info@sakhihub.com" className="inline-flex px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">
                {t('refundPolicy.raiseTicket')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
