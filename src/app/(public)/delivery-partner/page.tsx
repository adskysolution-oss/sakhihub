'use client';

import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { Truck, IndianRupee, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DeliveryPartnerPage() {
  const { t } = useLanguage();

  return (
    <>
      <PageBanner 
        title={t('deliveryPage.title')} 
        subtitle={t('deliveryPage.subtitle')}
        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1500"
      />
      
      <section className="section-padding">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '60px', alignItems: 'flex-start' }}>
            <div>
              <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '25px' }}>{t('deliveryPage.bizOpp')}</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '30px' }}>
                {t('deliveryPage.bizOppDesc')}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                <div className="glass-card" style={{ padding: '25px' }}>
                  <IndianRupee size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>{t('deliveryPage.income')}</h4>
                  <p style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '1.2rem' }}>₹25,000 – ₹50,000</p>
                </div>
                <div className="glass-card" style={{ padding: '25px' }}>
                  <ShieldCheck size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>{t('deliveryPage.deposit')}</h4>
                  <p style={{ color: 'var(--secondary)', fontWeight: '800', fontSize: '1.2rem' }}>₹25,000</p>
                </div>
              </div>

              <h3>{t('deliveryPage.reqTitle')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Truck size={20} color="var(--primary)" /> {t('deliveryPage.req1')}</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Truck size={20} color="var(--primary)" /> {t('deliveryPage.req2')}</li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><Truck size={20} color="var(--primary)" /> {t('deliveryPage.req3')}</li>
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ marginBottom: '25px', textAlign: 'center' }}>{t('deliveryPage.jdTitle')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>1</div>
                  <p style={{ fontSize: '0.95rem' }}>{t('deliveryPage.jd1')}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>2</div>
                  <p style={{ fontSize: '0.95rem' }}>{t('deliveryPage.jd2')}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>3</div>
                  <p style={{ fontSize: '0.95rem' }}>{t('deliveryPage.jd3')}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '32px', height: '32px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '700' }}>4</div>
                  <p style={{ fontSize: '0.95rem' }}>{t('deliveryPage.jd4')}</p>
                </div>
                
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="/register?role=delivery" className="btn-primary" style={{ justifyContent: 'center' }}>{t('deliveryPage.applyBtn')}</a>
                  <a href="/contact" className="btn-secondary" style={{ justifyContent: 'center' }}>
                    {t('deliveryPage.detailsBtn')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
