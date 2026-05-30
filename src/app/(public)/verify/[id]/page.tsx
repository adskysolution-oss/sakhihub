'use client';

import React, { useEffect, useState, use } from 'react';
import {
  BadgeCheck,
  ShieldAlert,
  XCircle,
  User,
  MapPin,
  Briefcase,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getProxiedImageUrl } from '@/utils/imageUrl';


interface VerificationData {
  fullName: string;
  role: string;
  profileImage?: string;
  registrationDate: string;
  state?: string;
  district?: string;
  organizationName?: string;
  status: string;
  isVerified: boolean;
  idNumber: string;
  accountStatus?: string;
  membershipStatus?: string;
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useLanguage();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const decodedId = decodeURIComponent(id);

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/public/verify-id?id=${encodeURIComponent(decodedId)}`);
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || t('verifyPage.errNoId'));
        }
      } catch (err) {
        setError(t('verifyPage.errFetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [decodedId]);

  const getStatusBadge = (status: string, role: string) => {
    if (['active', 'approved'].includes(status)) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full font-bold text-sm border border-green-200 shadow-sm">
          <BadgeCheck size={18} /> {t('verifyPage.verified')} {role.replace('_', ' ')}
        </div>
      );
    }
    if (['suspended', 'rejected', 'inactive'].includes(status)) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full font-bold text-sm border border-red-200 shadow-sm">
          <XCircle size={18} /> {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-bold text-sm border border-amber-200 shadow-sm">
        <ShieldAlert size={18} /> {t('verifyPage.pending')}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 md:p-12">

      <div className="w-full max-w-2xl mb-8 flex justify-start">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm">
          <ChevronLeft size={16} /> {t('verifyPage.backHome')}
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        {/* Verification Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">{t('verifyPage.identVerify')}</h1>
          <p className="text-gray-500 mt-2 font-medium">{t('verifyPage.official')}</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-semibold animate-pulse">{t('verifyPage.verifying')}</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-red-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-black text-secondary mb-2">{t('verifyPage.noRecord')}</h2>
            <p className="text-gray-500 font-medium max-w-sm mb-6">{error}</p>
            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-mono text-gray-600">
              {t('verifyPage.searchedId')} <strong>{decodedId}</strong>
            </div>
          </div>
        ) : data ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
            {/* Top Security Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-blue-400 to-primary"></div>

            <div className="p-8 md:p-10">
              {/* Header inside card */}
              <div className="flex justify-between items-start mb-10 border-b border-gray-100 pb-8">
                <div>
                  <img src="/logo.png" alt="SakhiHub Logo" className="h-10 mb-4" />
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {t('verifyPage.verifiedRec')}
                  </div>
                </div>
                {getStatusBadge(data.status, data.role)}
              </div>

              {/* Profile Section */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-10">
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-gray-100 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                    {data.profileImage ? (
                      <img src={getProxiedImageUrl(data.profileImage)} alt={data.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-gray-300" />
                    )}
                  </div>
                  {data.isVerified && (
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black text-secondary mb-1">{data.fullName}</h2>
                  <p className="text-primary font-bold uppercase tracking-widest text-xs mb-4">
                    {data.role.replace('_', ' ')}
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-700">
                    {t('verifyPage.id')} {data.idNumber}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('verifyPage.regDate')}</p>
                    <p className="font-semibold text-gray-800">{new Date(data.registrationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {(data.state || data.district) && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('verifyPage.region')}</p>
                      <p className="font-semibold text-gray-800">{data.district ? `${data.district}, ` : ''}{data.state}</p>
                    </div>
                  </div>
                )}

                {data.organizationName && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <Building size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('verifyPage.org')}</p>
                      <p className="font-semibold text-gray-800">{data.organizationName}</p>
                    </div>
                  </div>
                )}

                {data.membershipStatus && (
                  <div className="flex items-start gap-3">
                    <Briefcase size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{t('verifyPage.membership')}</p>
                      <p className="font-semibold text-gray-800 capitalize">{data.membershipStatus.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer inside card */}
            <div className="bg-slate-900 px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-xs text-gray-400 font-medium">{t('verifyPage.secure')}</span>
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                {t('verifyPage.generated')} {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Background Decorative */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
