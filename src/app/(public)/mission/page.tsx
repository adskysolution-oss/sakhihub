'use client';

import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function MissionPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageBanner
        title={t('missionPage.title')}
        subtitle={t('missionPage.subtitle')}
        image="/images/Our-Mission.jpeg"
      />

      <section className="section-padding">
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>
              {t('missionPage.title')}
            </h2>
            <div className="glass-card" style={{ padding: '60px 40px', fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '2', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <p>
                {t('missionPage.p1')}
              </p>
              <p style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                {t('missionPage.p2')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
