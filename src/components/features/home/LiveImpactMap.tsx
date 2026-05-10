'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Heart, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';

const LiveImpactMap = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/public/stats');
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error("Stats fetch failed", err);
      }
    };
    fetchStats();
  }, []);

  const activeDistricts = [
    { id: 1, name: 'Gurgaon', top: '22%', left: '38%', active: '1,200+ Women' },
    { id: 2, name: 'Jaipur', top: '28%', left: '34%', active: '850+ Women' },
    { id: 3, name: 'Lucknow', top: '26%', left: '50%', active: '2,100+ Women' },
    { id: 4, name: 'Patna', top: '30%', left: '68%', active: '1,500+ Women' },
    { id: 5, name: 'Indore', top: '48%', left: '42%', active: '950+ Women' },
    { id: 6, name: 'Nagpur', top: '55%', left: '48%', active: '600+ Women' },
    { id: 7, name: 'Hyderabad', top: '70%', left: '48%', active: '1,100+ Women' },
  ];

  const impactMetrics = [
    { label: language === 'hi' ? 'सक्रिय जिले' : 'Active Districts', val: stats ? `${stats.totalImpact / 1000}+` : '...', icon: MapPin, color: '#E91E63' },
    { label: language === 'hi' ? 'ग्राम प्रधान' : 'Village Leaders', val: stats ? stats.totalEmployees : '...', icon: Users, color: '#6A1B9A' },
    { label: language === 'hi' ? 'स्वास्थ्य शिविर' : 'Health Camps', val: stats ? Math.floor(stats.totalImpact / 50) : '...', icon: Heart, color: '#4CAF50' },
    { label: language === 'hi' ? 'प्रमाणित सदस्य' : 'Certified Members', val: stats ? `${(stats.totalMembers / 1000).toFixed(1)}k+` : '...', icon: ShieldCheck, color: '#FFD700' },
  ];

  return (
    <section className="py-16 md:py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm block mb-4">
            {language === 'hi' ? 'वास्तविक समय पदचिह्न' : 'REAL-TIME FOOTPRINT'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary leading-tight">
            {language === 'hi' ? <>पूरे <span className="text-gradient">भारत</span> में हमारा प्रभाव</> : <>Our Impact Across <span className="text-gradient">India</span></>}
          </h2>
          <p className="text-gray-500 mt-6 text-sm md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            {language === 'hi' 
              ? 'साखीहब तेजी से बढ़ रहा है, देश के हर कोने से महिलाओं को जोड़ रहा है।'
              : 'SakhiHub is rapidly growing, connecting women from every corner of the country.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center">
          {/* Stats List */}
          <div className="lg:col-span-2 space-y-6">
            {impactMetrics.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 bg-gray-50/50 rounded-[32px] flex items-center gap-6 border border-gray-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-black/5 hover:translate-x-2"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-black/[0.03] shrink-0" style={{ color: item.color }}>
                  <item.icon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-secondary leading-none">{item.val}</h3>
                  <p className="text-xs md:text-sm text-gray-500 font-bold mt-1 uppercase tracking-wider">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Realistic Map Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3 relative h-[500px] md:h-[700px] bg-gray-50/30 rounded-[40px] md:rounded-[60px] border border-gray-100 overflow-hidden shadow-2xl shadow-black/5"
          >
            {/* Proper India Map Image Background */}
            <div className="absolute inset-8 md:inset-12 flex items-center justify-center opacity-60">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/e/e0/India_map_blank.svg" 
                alt="India Map" 
                className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
              />
            </div>

            {/* Pulsing Markers */}
            {activeDistricts.map((district) => (
              <motion.div
                key={district.id}
                className="absolute z-10 group"
                style={{
                  top: district.top,
                  left: district.left,
                }}
              >
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full"
                  />
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full border-2 border-white shadow-lg shadow-primary/60 relative z-10" />
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-2xl text-[10px] md:text-xs font-bold text-secondary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-1 pointer-events-none border border-gray-100">
                    {district.name}: <span className="text-primary">{district.active}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            <div className="absolute bottom-8 right-8 text-right z-20">
               <h4 className="text-sm md:text-base font-bold text-secondary mb-2">Live Activity</h4>
               <p className="text-[10px] md:text-xs font-bold text-gray-500 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-white/50">
                  📍 Ongoing: New groups forming in Bihar and Rajasthan
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LiveImpactMap;

