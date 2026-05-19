'use client';

import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { Handshake, Target, Users, School, Home, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function PartnerPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageBanner 
        title={t('partnerPage.title')} 
        subtitle={t('partnerPage.subtitle')}
        image="https://images.unsplash.com/photo-1590333746438-d835a51052b7?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{t('partnerPage.whoPartner')}</h2>
            <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)' }}>{t('partnerPage.whoSubtitle')}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '80px' }}>
            {[
              { name: t('partnerPage.ngo'), icon: Target },
              { name: t('partnerPage.shg'), icon: Users },
              { name: t('partnerPage.school'), icon: School },
              { name: t('partnerPage.college'), icon: School },
              { name: t('partnerPage.distributor'), icon: Home },
              { name: t('partnerPage.socialOrg'), icon: Handshake },
            ].map(item => (
              <div key={item.name} className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
                  <item.icon size={40} />
                </div>
                <h4 style={{ color: 'var(--secondary)' }}>{item.name}</h4>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ marginBottom: '30px', color: 'var(--secondary)' }}>{t('partnerPage.areas')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><MessageSquare size={20} /></div>
                  <div>
                    <h5 style={{ color: 'var(--text-main)' }}>{t('partnerPage.area1')}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('partnerPage.area1Desc')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><Users size={20} /></div>
                  <div>
                    <h5 style={{ color: 'var(--text-main)' }}>{t('partnerPage.area2')}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('partnerPage.area2Desc')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ padding: '8px', background: 'var(--accent)', borderRadius: '10px', color: 'var(--primary)' }}><Home size={20} /></div>
                  <div>
                    <h5 style={{ color: 'var(--text-main)' }}>{t('partnerPage.area3')}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('partnerPage.area3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-gradient" style={{ marginBottom: '20px' }}>{t('partnerPage.inquiry')}</h3>
              <form className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder={t('partnerPage.orgName')} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="text" placeholder={t('partnerPage.contactPerson')} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <input type="tel" placeholder={t('partnerPage.mobile')} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
                  <option>{t('partnerPage.campsOpt')}</option>
                  <option>{t('partnerPage.distOpt')}</option>
                  <option>{t('partnerPage.trainOpt')}</option>
                </select>
                <textarea placeholder={t('partnerPage.message')} rows={4} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>{t('partnerPage.sendInquiry')}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
