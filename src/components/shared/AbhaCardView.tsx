import React from 'react';
import QRCode from 'react-qr-code';
import { Heart, Shield, Phone, Globe, User } from 'lucide-react';

export interface AbhaCardViewProps {
  card: {
    abhaNumber: string;
    abhaAddress: string;
    status?: string;
    profilePayload: {
      fullName: string;
      gender: string;
      dob: string;
      mobile: string;
      profilePhoto?: string;
    };
  };
}

const AbhaCardView: React.FC<AbhaCardViewProps> = ({ card }) => {
  const { abhaNumber, abhaAddress, profilePayload } = card;

  // Format ABHA number to standard XX-XXXX-XXXX-XXXX
  const formatAbhaNumber = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.length === 14) {
      return `${cleanNum.slice(0, 2)}-${cleanNum.slice(2, 6)}-${cleanNum.slice(6, 10)}-${cleanNum.slice(10, 14)}`;
    }
    return num;
  };

  const formattedAbhaNumber = formatAbhaNumber(abhaNumber);

  return (
    <div className="flex flex-col items-center">
      {/* Landscape Card Container */}
      <div 
        id="abha-physical-card"
        className="relative w-full max-w-[550px] h-[340px] bg-gradient-to-br from-blue-50 via-white to-teal-50 border-2 border-blue-200 rounded-[24px] shadow-2xl p-6 flex flex-col justify-between overflow-hidden font-sans print:shadow-none print:border-blue-400 print:my-0 print:mx-auto"
      >
        {/* Subtle Watermark Logo Background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center z-0">
          <Shield size={240} className="text-blue-900 fill-current" />
        </div>

        {/* Card Header */}
        <div className="relative z-10 flex justify-between items-center border-b border-blue-100 pb-3">
          <div className="flex items-center gap-3">
            {/* National Flag Tri-color Accent */}
            <div className="flex flex-col w-1.5 h-10 rounded-full overflow-hidden shrink-0">
              <div className="bg-[#FF9933] h-1/3" />
              <div className="bg-white h-1/3 border-x border-gray-100" />
              <div className="bg-[#128807] h-1/3" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black text-blue-900 tracking-wide leading-tight uppercase">आयुष्मान भारत डिजिटल मिशन</h3>
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-0.5">Ayushman Bharat Digital Mission</h4>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-900/5 px-3 py-1.5 rounded-full border border-blue-900/10">
            <Heart size={14} className="text-red-500 fill-red-500 shrink-0 animate-pulse" />
            <span className="text-[9px] font-black text-blue-900 tracking-wider uppercase">ABHA Card</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 flex-1 grid grid-cols-5 gap-4 items-center py-4">
          
          {/* User Image Area (Col-span 1.5) */}
          <div className="col-span-1.5 flex justify-center">
            <div className="w-[95px] h-[115px] rounded-xl border border-blue-200 bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              {profilePayload.profilePhoto ? (
                <img 
                  src={profilePayload.profilePhoto} 
                  alt="ABHA Holder" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback to icon on error
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('fallback-active');
                  }}
                />
              ) : (
                <div className="w-full h-full bg-blue-50/50 rounded-lg flex items-center justify-center text-blue-300">
                  <User size={40} strokeWidth={1.5} />
                </div>
              )}
              {/* Fallback layout */}
              <div className="hidden [.fallback-active_&]:flex w-full h-full bg-blue-50/50 rounded-lg items-center justify-center text-blue-300">
                <User size={40} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Demographic Metadata (Col-span 2) */}
          <div className="col-span-2 text-left space-y-2 pr-2 border-r border-blue-50/60 h-full flex flex-col justify-center">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Name</p>
              <h2 className="text-sm font-extrabold text-blue-950 uppercase truncate leading-tight mt-0.5">{profilePayload.fullName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Gender</p>
                <p className="text-xs font-black text-gray-800 uppercase mt-0.5">
                  {profilePayload.gender === 'M' || profilePayload.gender === 'MALE' ? 'Male' :
                   profilePayload.gender === 'F' || profilePayload.gender === 'FEMALE' ? 'Female' :
                   profilePayload.gender || 'Other'}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Date of Birth</p>
                <p className="text-xs font-black text-gray-800 mt-0.5">{profilePayload.dob}</p>
              </div>
            </div>

            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">ABHA Address</p>
              <p className="text-xs font-black text-teal-700 truncate mt-0.5 lowercase">{abhaAddress}</p>
            </div>
          </div>

          {/* Verification QR / Barcode Code (Col-span 1.5) */}
          <div className="col-span-1.5 flex flex-col items-center justify-center gap-2">
            <div className="bg-white p-2 rounded-xl border border-blue-100 shadow-sm shrink-0">
              <QRCode 
                value={`ABHA-Verification: ${abhaNumber} | ${abhaAddress} | ${profilePayload.fullName}`}
                size={82}
                level="M"
              />
            </div>
            <span className="text-[7px] text-gray-400 font-bold uppercase tracking-wider text-center">Scan to Verify</span>
          </div>

        </div>

        {/* Card Footer */}
        <div className="relative z-10 border-t border-blue-100 pt-3 flex justify-between items-center text-left">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">ABHA Number</p>
            <p className="text-lg font-black text-blue-900 tracking-wider leading-none mt-0.5">{formattedAbhaNumber}</p>
          </div>

          {/* Helpline & Links */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1 text-[8.5px] text-gray-500 font-bold">
              <Phone size={10} className="text-blue-900" />
              <span>14477</span>
            </div>
            <div className="flex items-center gap-1 text-[8.5px] text-gray-500 font-bold">
              <Globe size={10} className="text-blue-900" />
              <span>abdm.gov.in</span>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500" />
      </div>

      {/* Printing instruction stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          #abha-physical-card {
            border: 2px solid #3b82f6 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid;
            break-inside: avoid;
            background: white !important;
          }
        }
      `}} />
    </div>
  );
};

export default AbhaCardView;
