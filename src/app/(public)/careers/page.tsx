'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Search, ArrowRight, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function CareersPage() {
  const { t } = useLanguage();
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const res = await axios.get('/api/public/careers/vacancies');
      if (res.data.success) {
        setVacancies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching vacancies', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVacancies = vacancies.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 text-white py-20 px-4 mb-12">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            {t('careersPage.heroTitle')}
          </h1>
          <p className="text-lg md:text-xl text-pink-100 max-w-2xl mx-auto">
            {t('careersPage.heroDesc')}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('careersPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
          />
        </div>

        {/* Listings */}
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 font-medium">{t('careersPage.noVacancies')}</div>
            ) : (
              filteredVacancies.map((vacancy) => (
                <div key={vacancy._id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
                  {vacancy.isFeatured && (
                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 p-2 rounded-full">
                      <Star size={16} fill="currentColor" />
                    </div>
                  )}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-widest font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                      {vacancy.department}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{vacancy.title}</h3>
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <MapPin size={16} className="text-gray-400" /> {vacancy.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Briefcase size={16} className="text-gray-400" /> {vacancy.workType}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Clock size={16} className="text-gray-400" /> {t('careersPage.exp')} {vacancy.experience}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-lg font-black text-gray-900">{vacancy.salaryRange}</span>
                    <Link href={`/careers/${vacancy.slug}`} className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold text-sm">
                      {t('careersPage.viewDetails')} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
