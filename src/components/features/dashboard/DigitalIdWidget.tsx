import React from 'react';
import Link from 'next/link';
import { BadgeCheck, QrCode, ExternalLink, Printer, User } from 'lucide-react';
import Image from 'next/image';
import { getProxiedImageUrl } from '@/utils/imageUrl';

interface DigitalIdWidgetProps {
  user: any;
}

export default function DigitalIdWidget({ user }: DigitalIdWidgetProps) {
  if (!user) return null;

  // Determine if ID card is active/ready.
  const isReady = user.status === 'active' || user.isVerified || user.dashboardAccess;

  const idNumber = user.vendorCode || user.subVendorCode || user.employeeId || user._id;
  const displayRole = user.role === 'sub_vendor' ? 'Sub-Vendor' : user.role === 'vendor' ? 'Vendor' : user.role === 'employee' ? 'Employee' : 'Member';

  return (
    <div className={`p-8 rounded-[40px] shadow-2xl relative overflow-hidden ${isReady ? 'bg-gradient-to-br from-[#2C0A28] via-[#6A1B9A] to-[#D91656] text-white' : 'bg-white border border-gray-100'}`}>
      {/* Decorative background elements */}
      {isReady && (
        <>
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-[#FF4D8C]/20 rounded-full blur-2xl"></div>
        </>
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        {/* Left Side: Avatar & Details */}
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border-4 overflow-hidden ${isReady ? 'border-white/20 bg-white/10' : 'border-gray-50 bg-gray-100'}`}>
            {user.profileImage ? (
              <img src={getProxiedImageUrl(user.profileImage)} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <User size={32} className={isReady ? 'text-white/70' : 'text-gray-400'} />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-xl font-black ${isReady ? 'text-white' : 'text-gray-800'}`}>
                {user.fullName || 'User Name'}
              </h3>
              {isReady && (
                <span className="text-white bg-[#00C853] p-0.5 rounded-full" title="Verified">
                  <BadgeCheck size={16} />
                </span>
              )}
            </div>

            <p className={`text-sm font-bold tracking-wide ${isReady ? 'text-white/80' : 'text-gray-500'}`}>
              {displayRole}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${isReady ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                ID: {idNumber || 'N/A'}
              </span>
              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1 ${isReady ? 'bg-[#00C853]/20 text-[#00E676] border border-[#00C853]/30' : 'bg-amber-100 text-amber-700'}`}>
                {isReady ? 'Active' : 'Pending Generation'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: QR & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto mt-4 md:mt-0">

          {/* Dummy QR Icon to represent Digital nature */}
          <div className={`hidden sm:flex items-center justify-center w-16 h-16 rounded-xl ${isReady ? 'bg-white/10 text-white/50' : 'bg-gray-50 text-gray-300'}`}>
            <QrCode size={32} />
          </div>

          <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
            {isReady ? (
              <>
                <Link
                  href="/id-card"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#D91656] hover:bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  <ExternalLink size={16} /> View Full Card
                </Link>
                <Link
                  href="/id-card"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-black/20 hover:bg-black/30 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Printer size={16} /> Print Card
                </Link>
              </>
            ) : (
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-gray-400 mb-2">
                  Your ID card is not generated yet.
                </p>
                <button disabled className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  Preview Unavailable
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
