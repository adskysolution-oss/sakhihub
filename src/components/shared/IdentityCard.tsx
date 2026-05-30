import React from 'react';
import QRCode from 'react-qr-code';
import { User, MapPin, Calendar, ShieldCheck, PhoneCall, Building, FileText, Hash, Globe, Phone, Mail } from 'lucide-react';
import { getProxiedImageUrl } from '@/utils/imageUrl';

export interface IdentityCardProps {
  user: {
    fullName: string;
    role: string;
    idNumber: string;
    profileImage?: string;
    district?: string;
    block?: string;
    state?: string;
    mobile?: string;
    email?: string;
    joiningDate?: string | Date;
    organizationName?: string;
    bloodGroup?: string;
    pincode?: string;
    vendorType?: string;
    designation?: string;
  };
}

const IdentityCard: React.FC<IdentityCardProps> = ({ user }) => {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Administrator';
      case 'vendor': return 'Vendor';
      case 'sub_vendor': return 'Sub Vendor';
      case 'employee': return 'Employee';
      case 'member': return 'Member';
      default: return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getDesignation = (role: string) => {
    if (role === 'employee') return 'SakhiHub Executive';
    if (role === 'vendor') return 'SakhiHub Partner';
    if (role === 'sub_vendor') return 'SakhiHub Sub-Partner';
    if (role === 'member') return 'Verified Member';
    return 'SakhiHub Official';
  };

  const formatDisplayId = (idStr: string) => {
    if (!idStr) return 'N/A';
    let formatted = idStr.toUpperCase();
    if (formatted.startsWith('SHVND')) return `SH-VND-${formatted.substring(5)}`;
    if (formatted.startsWith('SHSVN')) return `SH-SVN-${formatted.substring(5)}`;
    if (formatted.startsWith('SHEMP')) return `SH-EMP-${formatted.substring(5)}`;
    if (formatted.startsWith('SH')) {
      const rest = formatted.substring(2);
      const match = rest.match(/^([A-Z]+)(\d+)$/);
      if (match) return `SH-${match[1]}-${match[2]}`;
      return `SH-${rest}`;
    }
    if (formatted.startsWith('VND')) return `VND-${formatted.substring(3)}`;
    if (formatted.startsWith('SVN')) return `SVN-${formatted.substring(3)}`;
    if (formatted.startsWith('EMP')) return `EMP-${formatted.substring(3)}`;
    return formatted;
  };

  // Format the Role display string dynamically
  const getFormattedRoleString = () => {
    const base = getRoleDisplayName(user.role);
    if (user.role === 'employee' && user.designation) {
      // capitalize designation
      const d = user.designation.replace(/\b\w/g, l => l.toUpperCase());
      return `${base} | ${d}`;
    }
    if ((user.role === 'vendor' || user.role === 'sub_vendor') && user.vendorType) {
      // format vendor type (e.g. 'company' -> 'Company Vendor')
      const vt = user.vendorType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${base} | ${vt}`;
    }
    return base;
  };

  const formattedRole = getFormattedRoleString();
  const designation = getDesignation(user.role);
  const displayId = formatDisplayId(user.idNumber);
  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${encodeURIComponent(user.idNumber)}` : `https://www.sakhihub.com/verify/${user.idNumber}`;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center font-sans text-gray-800 print:flex-row print:gap-6 print:items-start select-none">

      {/* ================= FRONT SIDE ================= */}
      <div className="relative w-[340px] h-[540px] bg-white rounded-[24px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col shrink-0 border border-gray-100 print:shadow-none print:border-gray-200">

        {/* Dotted Texture (Top Right) */}
        <svg className="absolute top-0 right-0 w-[140px] h-[140px] opacity-[0.06] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-front" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E91E63" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-front)" />
        </svg>

        {/* Top Left Waves */}
        <div className="absolute top-0 left-0 w-full h-[160px] z-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 340 160" className="absolute top-0 left-0 w-full h-full">
            <path d="M0,0 L340,0 L340,30 C220,60 160,20 80,60 C40,80 0,140 0,140 Z" fill="#FCE4EC" />
          </svg>
          <svg viewBox="0 0 340 160" className="absolute top-0 left-0 w-full h-full">
            <path d="M0,0 L260,0 C200,40 140,20 60,80 C20,110 0,140 0,140 Z" fill="url(#front-top-grad)" />
            <defs>
              <linearGradient id="front-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E91E63" />
                <stop offset="100%" stopColor="#9C27B0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom Waves */}
        <div className="absolute bottom-0 left-0 w-full h-[90px] z-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 340 90" className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
            <path d="M0,35 C100,-5 200,40 340,10 L340,90 L0,90 Z" fill="url(#front-bottom-grad)" />
            <defs>
              <linearGradient id="front-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E91E63" />
                <stop offset="100%" stopColor="#6A1B9A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Subtle Logo Watermark Background */}
        <div className="absolute right-[-40px] top-[30%] opacity-[0.03] pointer-events-none z-0 mix-blend-multiply">
          <img src="/logo.png" alt="" className="w-[300px]" />
        </div>

        {/* Top Header Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-full border border-gray-200/50 bg-gray-50/80 shadow-inner z-20"></div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 flex flex-col pt-[55px]">

          {/* Top Center Logo */}
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SakhiHub Logo" className="h-[46px] object-contain drop-shadow-sm" />
          </div>

          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            <div className="w-[105px] h-[105px] rounded-full p-[3px] bg-gradient-to-br from-[#E91E63] to-[#9C27B0] shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-50 flex items-center justify-center">
                {user.profileImage ? (
                  <img src={getProxiedImageUrl(user.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={44} className="text-gray-300" />
                )}
              </div>
            </div>
          </div>

          {/* Name & Designation Pill */}
          <div className="text-center mb-5 px-4">
            <h2 className="text-[20px] font-extrabold text-[#2C0A28] uppercase tracking-wide leading-tight">{user.fullName}</h2>
            <div className="mt-1.5 inline-block bg-gradient-to-r from-[#E91E63] to-[#9C27B0] text-white px-5 py-[5px] rounded-full shadow-md">
              <p className="text-[10px] font-bold tracking-widest uppercase">{designation}</p>
            </div>
          </div>

          {/* User Details Summary List */}
          <div className="px-7 w-full flex-1 pt-1">
            <div className="flex flex-col w-full text-[10.5px]">
              {[
                { label: 'ID Number', value: displayId, icon: FileText },
                { label: 'Role', value: formattedRole, icon: User },
                { label: 'Mobile', value: user.mobile, icon: Phone },
                { label: 'Valid Upto', value: user.joiningDate ? new Date(new Date(user.joiningDate).setFullYear(new Date(user.joiningDate).getFullYear() + 1)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31 May 2027', icon: Calendar },
              ].filter(item => item.value).map((item, idx) => (
                <div key={idx} className="flex items-center py-[8px] border-b border-gray-100 last:border-0">
                  <div className="w-6 flex justify-center text-[#E91E63] mr-2">
                    <item.icon size={13.5} strokeWidth={2} />
                  </div>
                  <span className="w-[75px] text-gray-600 font-medium">{item.label}</span>
                  <span className="px-1.5 text-gray-400">:</span>
                  <span className="font-bold text-gray-900 flex-1 truncate ml-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom QR & Verification Badge */}
          <div className="px-8 w-full flex justify-between items-end pb-[26px] mt-auto relative z-20">
            {/* QR Box */}
            <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm shrink-0 relative top-1">
              <QRCode value={verificationUrl} size={46} level="H" />
            </div>

            {/* Verified Badge */}
            <div className="flex items-center gap-2 relative top-1">
              <div className="bg-gradient-to-br from-[#E91E63] to-[#C2185B] rounded-lg p-1.5 text-white shadow-sm">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11.5px] font-extrabold text-gray-900 leading-tight">Verified Member</span>
                <span className="text-[7px] text-gray-500 leading-tight font-medium mt-0.5">This identity is officially<br />verified by SakhiHub</span>
              </div>
            </div>
          </div>

          {/* Footer Tagline */}
          <div className="absolute bottom-2.5 w-full text-center text-white/95 text-[7px] font-bold tracking-[0.1em] z-30 flex items-center justify-center gap-1.5">
            <span className="opacity-70">●</span>
            SH - EMPOWERING COMMUNITY, EMPOWERING WOMEN
            <span className="opacity-70">●</span>
          </div>

        </div>
      </div>

      {/* ================= BACK SIDE ================= */}
      <div className="relative w-[340px] h-[540px] bg-white rounded-[24px] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col shrink-0 border border-gray-100 print:shadow-none print:border-gray-200">

        {/* Dotted Texture (Top Left) */}
        <svg className="absolute top-0 left-0 w-[140px] h-[140px] opacity-[0.06] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots-back" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E91E63" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-back)" />
        </svg>

        {/* Subtle Background Mark */}
        <div className="absolute top-[35%] -right-[30px] opacity-[0.03] pointer-events-none z-0">
          <img src="/logo.png" alt="" className="w-[240px]" />
        </div>

        {/* Top Header Hole */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-full border border-gray-200/50 bg-gray-50/80 shadow-inner z-20"></div>

        {/* Top Back Waves (Top Right) */}
        <div className="absolute top-0 left-0 w-full h-[150px] z-0 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 340 150" className="absolute top-0 right-0 w-full h-full" preserveAspectRatio="none">
            <path d="M340,0 L80,0 C160,40 240,20 340,80 Z" fill="#FCE4EC" />
          </svg>
          <svg viewBox="0 0 340 150" className="absolute top-0 right-0 w-full h-full" preserveAspectRatio="none">
            <path d="M340,0 L140,0 C210,30 270,10 340,60 Z" fill="url(#back-top-grad)" />
            <defs>
              <linearGradient id="back-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E91E63" />
                <stop offset="100%" stopColor="#9C27B0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content Container (No Logo here) */}
        <div className="relative z-10 flex-1 flex flex-col pt-[85px]">

          {/* Detailed Address Table */}
          <div className="px-10 w-full flex flex-col gap-4 text-[11.5px] mb-6 mt-4">
            {[
              { label: 'Organization', value: user.organizationName || 'SakhiHub', icon: Building },
              { label: 'State', value: user.state, icon: MapPin },
              { label: 'District', value: user.district, icon: Building },
              { label: 'Block', value: user.block, icon: MapPin },
              { label: 'Pincode', value: user.pincode, icon: Hash }
            ].filter(item => item.value).map((item, idx) => (
              <div key={idx} className="flex items-center">
                <div className="w-6 flex justify-center text-[#E91E63] mr-2">
                  <item.icon size={15} strokeWidth={2.5} />
                </div>
                <span className="w-[85px] font-semibold text-gray-700">{item.label}</span>
                <span className="px-2 text-gray-400">:</span>
                <span className="font-bold text-gray-900 flex-1 truncate">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Terms & Conditions Header */}
          <div className="mt-6 mb-4 flex items-center justify-center">
            <div className="h-[1px] w-12 bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E91E63] mx-2 shadow-sm opacity-80"></div>
            <span className="text-[10px] font-black text-[#E91E63] uppercase tracking-widest mx-1">
              Terms & Conditions
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E91E63] mx-2 shadow-sm opacity-80"></div>
            <div className="h-[1px] w-12 bg-gray-300"></div>
          </div>

          {/* T&C List */}
          <div className="px-10 mb-8">
            <ul className="text-[10px] text-gray-700 list-disc pl-3 space-y-2 font-medium leading-relaxed tracking-tight">
              <li>This card is non-transferable.</li>
              <li>Use of this card is strictly for official SakhiHub work only.</li>
              <li>This card must be carried while on official duty.</li>
              <li>If found, please return to the nearest SakhiHub office.</li>
            </ul>
          </div>

          {/* Signatures & Seal Area */}
          <div className="flex justify-between items-end px-10 mt-auto pb-8 z-10">
            <div className="flex flex-col items-center">
              <img
                src={user.role === 'employee' ? "/manager-signature.png" : "/signature-placeholder.png"}
                alt="Signature"
                className={user.role === 'employee' ? "h-10 w-auto object-contain mb-0.5 mix-blend-darken" : "h-8 opacity-80 mb-1"}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="h-[1px] w-[100px] bg-gray-400 mb-1.5"></div>
              <span className="text-[9px] font-bold text-gray-600">Authorized Signatory</span>
            </div>

            <div className="relative ml-2">
              {/* Circular Verification Stamp */}
              <div className="w-[75px] h-[75px] rounded-full border-[1.5px] border-[#E91E63] flex items-center justify-center p-0.5 opacity-90 shadow-sm bg-white">
                <div className="w-full h-full rounded-full border border-[#E91E63] border-dashed flex flex-col items-center justify-center relative bg-pink-50/50">
                  <svg viewBox="0 0 100 100" className="absolute w-full h-full text-[#E91E63] animate-spin-slow" style={{ animationDuration: '20s' }}>
                    <path id="curve-back" d="M 15 50 A 35 35 0 1 1 85 50 A 35 35 0 1 1 15 50" fill="transparent" />
                    <text className="text-[13px] font-black uppercase tracking-[0.15em]" fill="currentColor">
                      <textPath href="#curve-back" startOffset="25%" textAnchor="middle">SAKHIHUB</textPath>
                      <textPath href="#curve-back" startOffset="75%" textAnchor="middle">VERIFIED</textPath>
                    </text>
                  </svg>
                  <img src="/logo.png" className="w-[24px] opacity-80" alt="" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div className="relative w-full h-[60px] z-10 flex flex-col justify-end overflow-hidden rounded-b-[24px] mt-2">
            {/* Bottom Wave Background */}
            <svg viewBox="0 0 340 60" className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
              <path d="M0,35 C100,55 240,-10 340,25 L340,60 L0,60 Z" fill="url(#back-bottom-grad)" />
              <defs>
                <linearGradient id="back-bottom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E91E63" />
                  <stop offset="100%" stopColor="#6A1B9A" />
                </linearGradient>
              </defs>
            </svg>

            {/* Footer Content */}
            <div className="absolute bottom-4 w-full flex justify-center items-center gap-3.5 text-white/95">
              <div className="flex items-center gap-1.5">
                <Globe size={11.5} />
                <span className="text-[9.5px] font-semibold tracking-wider">www.sakhihub.com</span>
              </div>
              <div className="h-3 w-[1px] bg-white/40"></div>
              <div className="flex items-center gap-1.5">
                <PhoneCall size={11.5} />
                <span className="text-[9.5px] font-semibold tracking-wider">Support: 8076611842</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default IdentityCard;
