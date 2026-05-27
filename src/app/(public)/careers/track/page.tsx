'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { Search, Briefcase, MapPin, CheckCircle2, XCircle, Clock, SearchIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

function TrackingForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialAppId = searchParams?.get('appId') || '';

  const [formData, setFormData] = useState({
    applicationId: initialAppId,
    mobile: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    // If we have an appId from URL, we just need them to enter mobile. 
    // We don't auto-fetch unless we also have mobile in local storage.
    if (initialAppId) {
      try {
        const stored = localStorage.getItem('sakhihub_applied_vacancies');
        if (stored) {
          const parsed = JSON.parse(stored);
          const match = Object.values(parsed).find((app: any) => app.applicationId === initialAppId);
          if (match && (match as any).mobile) {
            setFormData(prev => ({ ...prev, mobile: (match as any).mobile }));
            handleSearch(null, initialAppId, (match as any).mobile);
          }
        }
      } catch (e) {}
    }
  }, [initialAppId]);

  const handleSearch = async (e?: React.FormEvent | null, appId: string = formData.applicationId, mobile: string = formData.mobile) => {
    if (e) e.preventDefault();
    if (!appId || !mobile) {
      setError(t('careersPage.errEnterBoth'));
      return;
    }

    setLoading(true);
    setError('');
    setApplication(null);

    try {
      const res = await axios.get(`/api/public/careers/track?applicationId=${appId}&mobile=${mobile}`);
      if (res.data.success) {
        setApplication(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('careersPage.errFetchDetails'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'On Hold': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Under Review': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selected': return <CheckCircle2 size={24} className="text-green-600" />;
      case 'Rejected': return <XCircle size={24} className="text-rose-600" />;
      case 'On Hold': return <Clock size={24} className="text-amber-600" />;
      case 'Under Review': return <Search size={24} className="text-blue-600" />;
      default: return <Clock size={24} className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t('careersPage.trackAppTitle')}</h1>
          <p className="text-gray-500 font-medium">{t('careersPage.trackAppDesc')}</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.appIdLabel')}</label>
              <input 
                type="text" 
                required 
                value={formData.applicationId} 
                onChange={e => setFormData({...formData, applicationId: e.target.value.toUpperCase()})} 
                placeholder="APP-XXXXXX"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" 
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('careersPage.mobileLabel')}</label>
              <input 
                type="tel" 
                maxLength={10}
                required 
                value={formData.mobile} 
                onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, '')})} 
                placeholder="10-digit number"
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-gray-900 focus:outline-none focus:border-pink-500" 
              />
            </div>
            <div className="md:pt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto h-[58px] px-8 bg-pink-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? t('careersPage.checking') : <><SearchIcon size={18} /> {t('careersPage.trackBtn')}</>}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-bold text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {application && (
          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-gray-100 pb-8 mb-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('careersPage.appDetailsLabel')}</p>
                <h2 className="text-2xl font-black text-gray-900">{application.fullName}</h2>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><Briefcase size={16} /> {application.vacancyTitle}</span>
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {application.location}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-black text-gray-400 block mb-1">{t('careersPage.appIdLabel')}</span>
                <span className="font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-xl inline-block">{application.applicationId}</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 w-full space-y-6">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{t('careersPage.currentStatus')}</h3>
                  <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    <span className="font-black uppercase tracking-widest text-sm">{application.status}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('careersPage.appliedOn')}</h3>
                  <p className="font-bold text-gray-800">{new Date(application.appliedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {application.adminRemarks && (
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 mt-6">
                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">{t('careersPage.remarksHR')}</h3>
                    <p className="font-medium text-purple-900">{application.adminRemarks}</p>
                  </div>
                )}
              </div>

              <div className="w-full md:w-64 shrink-0 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('careersPage.whatsNext')}</h3>
                <ul className="space-y-4 text-sm text-gray-600 font-medium">
                  {application.status === 'New' && (
                    <li className="flex gap-3"><ChevronRight size={16} className="text-pink-500 shrink-0 mt-0.5" /> {t('careersPage.nextNew')}</li>
                  )}
                  {application.status === 'Under Review' && (
                    <li className="flex gap-3"><ChevronRight size={16} className="text-blue-500 shrink-0 mt-0.5" /> {t('careersPage.nextReview')}</li>
                  )}
                  {application.status === 'Selected' && (
                    <li className="flex gap-3"><ChevronRight size={16} className="text-green-500 shrink-0 mt-0.5" /> {t('careersPage.nextSelected')}</li>
                  )}
                  {application.status === 'Rejected' && (
                    <li className="flex gap-3"><ChevronRight size={16} className="text-rose-500 shrink-0 mt-0.5" /> {t('careersPage.nextRejected')}</li>
                  )}
                  {application.status === 'On Hold' && (
                    <li className="flex gap-3"><ChevronRight size={16} className="text-amber-500 shrink-0 mt-0.5" /> {t('careersPage.nextHold')}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CareerTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24"><div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div></div>}>
      <TrackingForm />
    </Suspense>
  );
}
