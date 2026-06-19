'use client';

import React, { useEffect, useState, use } from 'react';
import {
  BadgeCheck,
  ShieldAlert,
  XCircle,
  User,
  MapPin,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { getProxiedImageUrl } from '@/utils/imageUrl';

interface PublicVerificationData {
  employeeName: string;
  designation: string;
  employeeId: string;
  state: string;
  district: string;
  block?: string | null;
  authorizationNumber: string;
  issueDate: string;
  validUntil: string;
  status: 'active' | 'revoked' | 'expired';
}

export default function PublicVerifyAuthorizationPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const decodedId = decodeURIComponent(id);

  const [data, setData] = useState<PublicVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/public/authorization/${encodeURIComponent(decodedId)}`);
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Authorization Letter not found or is invalid.');
        }
      } catch (err) {
        setError('Failed to fetch verification status. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [decodedId]);

  const getStatusBadge = (status: 'active' | 'revoked' | 'expired') => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-full font-black text-xs uppercase tracking-wider border border-green-200 shadow-sm">
            <BadgeCheck size={16} /> Verified Active
          </div>
        );
      case 'revoked':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 rounded-full font-black text-xs uppercase tracking-wider border border-red-200 shadow-sm animate-pulse">
            <XCircle size={16} /> Revoked / Invalid
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-600 rounded-full font-black text-xs uppercase tracking-wider border border-gray-300 shadow-sm">
            <Clock size={16} /> Expired Letter
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 rounded-full font-black text-xs uppercase tracking-wider border border-amber-200 shadow-sm">
            <ShieldAlert size={16} /> Unknown
          </div>
        );
    }
  };

  const getBannerHeader = (status: 'active' | 'revoked' | 'expired') => {
    switch (status) {
      case 'active':
        return (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center rounded-2xl flex flex-col items-center justify-center gap-2 mb-8 shadow-md">
            <CheckCircle2 size={36} />
            <h2 className="text-lg font-black uppercase tracking-wider">Verified Active Representative</h2>
            <p className="text-xs opacity-90 font-medium">This representative is actively authorized to conduct field outreach.</p>
          </div>
        );
      case 'revoked':
        return (
          <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center rounded-2xl flex flex-col items-center justify-center gap-2 mb-8 shadow-md">
            <ShieldAlert size={36} />
            <h2 className="text-lg font-black uppercase tracking-wider">Invalid / Revoked Authorization</h2>
            <p className="text-xs opacity-90 font-medium">This authorization letter is no longer valid. Operational authority is revoked.</p>
          </div>
        );
      case 'expired':
        return (
          <div className="bg-gradient-to-r from-gray-500 to-slate-600 p-6 text-white text-center rounded-2xl flex flex-col items-center justify-center gap-2 mb-8 shadow-md">
            <Clock size={36} />
            <h2 className="text-lg font-black uppercase tracking-wider">Expired Authorization</h2>
            <p className="text-xs opacity-90 font-medium">The validity period of this authorization letter has expired.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 md:p-12">
      {/* Back to Home Link */}
      <div className="w-full max-w-2xl mb-6 flex justify-start">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all font-bold text-sm">
          <ChevronLeft size={16} /> Back to Homepage
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        {/* Verification Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-3 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Authorization Verification</h1>
          <p className="text-gray-400 font-bold text-xs mt-2 uppercase tracking-widest">Official Internal Document Registry</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs animate-pulse">Running live checks...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-10 md:p-12 shadow-xl border border-red-100 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100 shadow-inner">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-black text-secondary mb-2">Verification Failed</h2>
            <p className="text-gray-400 font-bold text-sm max-w-md mb-6 leading-relaxed">{error}</p>
            <div className="px-5 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono text-gray-500">
              Searched Document ID: <strong>{decodedId}</strong>
            </div>
          </div>
        ) : data ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
            {/* Top Branding Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-purple-500 to-primary"></div>

            <div className="p-8 md:p-10">
              {/* Logo & Badge Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="SakhiHub Logo" className="h-10 object-contain" />
                  <div className="w-0.5 h-8 bg-gray-200"></div>
                  <div>
                    <h3 className="font-extrabold text-secondary text-base leading-none">SakhiHub</h3>
                    <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Internal Registry</span>
                  </div>
                </div>
                {getStatusBadge(data.status)}
              </div>

              {/* Status Banner */}
              {getBannerHeader(data.status)}

              {/* Profile details */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-gray-100 flex flex-col items-center justify-center text-secondary shadow-inner shrink-0">
                  <User size={40} className="text-gray-300" />
                </div>
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2 className="text-2xl font-black text-secondary leading-tight mb-1 truncate">{data.employeeName}</h2>
                  <p className="text-primary font-black uppercase tracking-widest text-xs mb-3">{data.designation}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-600">
                    ID: {data.employeeId}
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 mb-8">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorization Number</p>
                  <p className="font-mono font-bold text-secondary text-sm">{data.authorizationNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Assigned Region</p>
                  <p className="font-bold text-secondary text-sm">
                    {data.block ? `${data.block}, ` : ''}{data.district}, {data.state}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="font-bold text-secondary text-sm">
                    {new Date(data.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Valid Until</p>
                  <p className="font-bold text-secondary text-sm">
                    {new Date(data.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Mandatory Disclaimer</p>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed text-justify">
                  SakhiHub is a private organization conducting awareness and community outreach activities. This authorization letter does not represent any Government Department, Government Scheme, Government Authority or Government Employment. The representative is not a government employee and has no authority to bind any government entity or collect cash on behalf of any government department.
                </p>
              </div>
            </div>

            {/* Verification card footer */}
            <div className="bg-slate-900 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-xs text-gray-400 font-medium">Secured Registry Record</span>
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                Verified at: {new Date().toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Background shapes */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
