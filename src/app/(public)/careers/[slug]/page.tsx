'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, ChevronLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function VacancyDetailsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const [vacancy, setVacancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) fetchVacancy();
  }, [params.slug]);

  const fetchVacancy = async () => {
    try {
      const res = await axios.get(`/api/public/careers/vacancies/${params.slug}`);
      if (res.data.success) {
        setVacancy(res.data.data);
        checkLocalStorageAndSession(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching vacancy details', err);
    } finally {
      setLoading(false);
    }
  };

  const [existingApp, setExistingApp] = useState<any>(null);

  const checkLocalStorageAndSession = async (vacancyData: any) => {
    try {
      const stored = localStorage.getItem('sakhihub_applied_vacancies');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[vacancyData._id]) {
          const app = parsed[vacancyData._id];
          const res = await axios.get(`/api/public/careers/track?applicationId=${app.applicationId}&mobile=${app.mobile}`);
          if (res.data.success) {
            setExistingApp({
              applicationId: res.data.data.applicationId,
              status: res.data.data.status
            });
            return;
          }
        }
      }
    } catch(e) {}
    
    try {
      const { default: axios } = await import('axios');
      const res = await axios.get('/api/auth/me');
      if (res.data.success && res.data.data?.mobile) {
        const checkRes = await axios.get(`/api/public/careers/check-status?mobile=${res.data.data.mobile}&vacancyId=${vacancyData._id}`);
        if (checkRes.data.success && checkRes.data.applied) {
          setExistingApp(checkRes.data.data);
        }
      }
    } catch(e) {}
  };

  if (loading) return <div className="min-h-screen pt-32 text-center"><div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div></div>;
  if (!vacancy) return <div className="min-h-screen pt-32 text-center font-bold text-gray-500">{t('careersPage.vacancyNotFound')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/careers" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pink-600 mb-8 transition-colors">
          <ChevronLeft size={16} /> {t('careersPage.backToCareers')}
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-pink-600 bg-pink-50 px-4 py-2 rounded-full inline-block mb-4">
                {vacancy.department}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{vacancy.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><MapPin size={16} className="text-gray-400" /> {vacancy.location}</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><Briefcase size={16} className="text-gray-400" /> {vacancy.workType}</div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"><Clock size={16} className="text-gray-400" /> {t('careersPage.exp')} {vacancy.experience}</div>
                {vacancy.lastDate && (
                  <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg">
                    <Calendar size={16} /> {t('careersPage.applyBy')} {new Date(vacancy.lastDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            {existingApp ? (
              <div className="shrink-0 flex flex-col gap-2">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest text-center flex flex-col gap-1 shadow-sm">
                  <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> {t('careersPage.alreadyAppliedTitle')}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mx-auto ${
                    existingApp.status === 'Selected' ? 'bg-green-100 text-green-700' :
                    existingApp.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{t('careersPage.statusLabel')} {existingApp.status}</span>
                </div>
                <Link href={`/careers/track?appId=${existingApp.applicationId}`} className="text-xs font-bold text-gray-500 hover:text-blue-600 text-center transition-colors">
                  <span dangerouslySetInnerHTML={{ __html: t('careersPage.trackApp') }} />
                </Link>
              </div>
            ) : vacancy.status === 'Open' ? (
              <Link href={`/careers/apply/${vacancy.slug}`} className="shrink-0 bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 inline-flex items-center gap-2 justify-center">
                {t('careersPage.applyNow')} <ArrowRight size={18} />
              </Link>
            ) : (
              <div className="shrink-0 bg-gray-200 text-gray-500 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-center cursor-not-allowed">
                {vacancy.status}
              </div>
            )}
          </div>

          <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">{t('careersPage.salaryRemun')}</p>
              <p className="text-xl font-black text-purple-900">{vacancy.salaryRange}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 space-y-12">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-4">{t('careersPage.aboutRole')}</h2>
            <div className="prose prose-pink max-w-none text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
              {vacancy.description}
            </div>
          </section>

          {vacancy.responsibilities?.length > 0 && (
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">{t('careersPage.responsibilities')}</h2>
              <ul className="space-y-3">
                {vacancy.responsibilities.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 font-medium">
                    <CheckCircle2 size={20} className="text-pink-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {vacancy.requirements?.length > 0 && (
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">{t('careersPage.reqElig')}</h2>
              <ul className="space-y-3">
                {vacancy.requirements.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600 font-medium">
                    <CheckCircle2 size={20} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {vacancy.eligibility && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-bold text-gray-700">
                  {vacancy.eligibility}
                </div>
              )}
            </section>
          )}

          {vacancy.benefits?.length > 0 && (
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">{t('careersPage.perksBen')}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {vacancy.benefits.map((item: string, idx: number) => (
                  <div key={idx} className="bg-pink-50 p-4 rounded-xl text-pink-900 font-medium text-sm border border-pink-100">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {existingApp ? (
            <div className="pt-8 border-t border-gray-100 text-center">
              <Link href={`/careers/track?appId=${existingApp.applicationId}`} className="bg-blue-50 text-blue-700 border border-blue-200 px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-100 transition-colors inline-flex items-center gap-2 shadow-sm">
                {t('careersPage.trackAppStatus')} <ArrowRight size={18} />
              </Link>
            </div>
          ) : vacancy.status === 'Open' && (
            <div className="pt-8 border-t border-gray-100 text-center">
              <Link href={`/careers/apply/${vacancy.slug}`} className="bg-pink-600 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 inline-flex items-center gap-2">
                {t('careersPage.applyPos')} <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
