'use client';

import PageBanner from "@/components/ui/PageBanner";
import React, { useEffect, useState } from "react";
import { CheckCircle, Target, Users, MapPin, Package, Heart, Globe, Sparkles, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import axios from "axios";

export default function CampaignPage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get('/api/public/campaigns');
        if (res.data.success) setCampaigns(res.data.data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      <PageBanner 
        title={t('campaignPage.title')} 
        subtitle={t('campaignPage.subtitle')}
        images={[
          "/images/campaign_health.png",
          "/images/campaign_sanitary.png",
          "/images/Hygiene-Education.jpeg"
        ]}
      />
      
      {/* Dynamic Campaigns Section */}
      <section className="section-padding">
        <div className="container">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-bold">{t('campaignPage.loading')}</p>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="flex flex-col gap-20">
              {campaigns.map((camp, index) => (
                <div key={camp._id} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 !== 0 ? 'lg:direction-rtl' : ''}`}>
                  <motion.div {...fadeInUp} className={`text-center lg:text-left ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
                    <span className="text-primary font-bold uppercase tracking-[2px] text-xs sm:text-sm">{t('campaignPage.activeMovement')}</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mt-5 mb-8 leading-tight">
                      {camp.title}
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                      {camp.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 text-left max-w-xl mx-auto lg:mx-0">
                      {(camp.targetAudience?.split(',') || ['Period Hygiene Education', 'Infection Prevention', 'Health Awareness']).map((item: string) => (
                        <div key={item} className="flex gap-4 items-center text-secondary font-bold text-sm sm:text-base group">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
                            <CheckCircle size={16} />
                          </div>
                          <span className="truncate">{item.trim()}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/register" className="btn-primary py-5 px-10 text-base sm:text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform inline-flex">
                      {t('campaignPage.joinCampaign')} <ArrowRight size={20} className="ml-3" />
                    </Link>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className={`relative mt-12 lg:mt-0 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}
                  >
                    <div className="rounded-[40px] lg:rounded-[60px] overflow-hidden h-[300px] sm:h-[450px] lg:h-[550px] shadow-2xl shadow-black/10 border-[6px] lg:border-[10px] border-gray-50">
                      <img 
                        src={camp.bannerImage || "/images/campaign_membership.png"} 
                        className="w-full h-full object-cover" 
                        alt={camp.title}
                      />
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[40px]">
              <Sparkles size={48} className="text-primary/20 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-secondary">{t('campaignPage.noCampaigns')}</h3>
              <p className="text-gray-400 font-bold mt-2">{t('campaignPage.checkBackSoon')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Field Activities Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary leading-tight">{t('campaignPage.groundReality').split(' ').slice(0, -2).join(' ')} <span className="text-gradient">{t('campaignPage.groundReality').split(' ').slice(-2).join(' ')}</span></h2>
            <p className="text-gray-500 mt-4 text-sm sm:text-lg lg:text-xl font-medium">{t('campaignPage.groundSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: t('campaignPage.groupAwareness'), desc: t('campaignPage.groupAwarenessDesc'), icon: Users, color: "#E91E63" },
              { title: t('campaignPage.directOutreach'), desc: t('campaignPage.directOutreachDesc'), icon: MapPin, color: "#6A1B9A" },
              { title: t('campaignPage.productAccess'), desc: t('campaignPage.productAccessDesc'), icon: Package, color: "#4CAF50" }
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white p-8 lg:p-12 rounded-[40px] shadow-xl shadow-black/[0.03] border border-gray-100 flex flex-col transition-all"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/[0.02]"
                  style={{ background: `${item.color}10`, color: item.color }}
                >
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-5 leading-tight">{item.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-white text-center">
        <div className="container">
          <div className="bg-gradient-to-br from-primary to-secondary p-8 sm:p-16 lg:p-24 rounded-[40px] lg:rounded-[60px] text-white relative overflow-hidden shadow-2xl">
            <Globe size={60} className="mx-auto mb-8 opacity-30" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight max-w-4xl mx-auto">{t('campaignPage.beChange')}</h2>
            <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto mb-12 lg:mb-16 font-medium leading-relaxed">
              {t('campaignPage.beChangeDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link href="/register" className="btn-primary py-5 px-10 sm:px-12 text-base sm:text-lg rounded-2xl bg-white text-primary shadow-2xl w-full sm:w-auto hover:scale-105 transition-transform">
                 {t('campaignPage.joinVolunteer')}
              </Link>
              <Link href="/contact" className="btn-secondary py-5 px-10 sm:px-12 text-base sm:text-lg rounded-2xl bg-transparent border-2 border-white/40 hover:border-white hover:bg-white/5 w-full sm:w-auto transition-all">
                 {t('campaignPage.partnerUs')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
