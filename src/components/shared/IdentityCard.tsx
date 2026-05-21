import React from 'react';
import QRCode from 'react-qr-code';
import { User, MapPin, Phone, Calendar, ShieldCheck, CheckCircle2, Globe, PhoneCall, Building, Droplet } from 'lucide-react';

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
    joiningDate?: string | Date;
    organizationName?: string;
    bloodGroup?: string;
    pincode?: string;
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

  // Format ID from SHEMP1025 to SH-EMP-1025 for display
  const formatDisplayId = (idStr: string) => {
    if (!idStr) return 'N/A';
    
    // Extract SH if it exists
    let formatted = idStr.toUpperCase();
    if (formatted.startsWith('SHVND')) {
      return `SH-VND-${formatted.substring(5)}`;
    } else if (formatted.startsWith('SHSVN')) {
      return `SH-SVN-${formatted.substring(5)}`;
    } else if (formatted.startsWith('SHEMP')) {
      return `SH-EMP-${formatted.substring(5)}`;
    } else if (formatted.startsWith('SH')) {
      // Fallback for general SH prefix
      const rest = formatted.substring(2);
      // Try to separate letters and numbers
      const match = rest.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        return `SH-${match[1]}-${match[2]}`;
      }
      return `SH-${rest}`;
    }
    
    // Legacy formats
    if (formatted.startsWith('VND')) return `VND-${formatted.substring(3)}`;
    if (formatted.startsWith('SVN')) return `SVN-${formatted.substring(3)}`;
    if (formatted.startsWith('EMP')) return `EMP-${formatted.substring(3)}`;
    
    return formatted;
  };

  const formattedRole = getRoleDisplayName(user.role);
  const designation = getDesignation(user.role);
  const displayId = formatDisplayId(user.idNumber);
  const verificationUrl = typeof window !== 'undefined' ? `${window.location.origin}/verify/${encodeURIComponent(user.idNumber)}` : `https://www.sakhihub.com/verify/${user.idNumber}`;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center font-sans text-gray-800 print:flex-row print:gap-6 print:items-start">
      
      {/* ================= FRONT SIDE ================= */}
      <div className="relative w-[324px] h-[513px] bg-white rounded-[20px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col print:shadow-none print:border-gray-200 shrink-0">
        
        {/* Top Header Hole */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-2.5 rounded-full border border-gray-300 bg-white shadow-inner z-20"></div>

        {/* Top Header Curves */}
        <div className="absolute top-0 left-0 w-full h-[140px] z-0">
          {/* Light Pink Outer Wave */}
          <svg viewBox="0 0 324 140" preserveAspectRatio="none" className="w-full h-full absolute top-0 left-0">
            <path d="M0,0 L324,0 L324,70 C240,140 100,100 0,60 Z" fill="#FCE4EC" />
          </svg>
          {/* Magenta Main Wave */}
          <svg viewBox="0 0 324 140" preserveAspectRatio="none" className="w-full h-full absolute top-0 left-0">
            <path d="M0,0 L324,0 L324,55 C220,110 80,70 0,40 Z" fill="#D91656" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 flex flex-col pt-16 px-5 pb-0">
          
          {/* Logo Section */}
          <div className="flex items-center gap-1.5 mb-5">
            <img src="/logo.png" alt="SakhiHub Logo" className="h-9" />
            <div className="flex flex-col">
              <span className="text-[#D91656] font-black text-xl leading-none tracking-tight">Sakhi<span className="text-[#2C0A28]">Hub</span></span>
              <span className="text-[5px] font-bold text-gray-500 tracking-[0.1em] mt-0.5">EMPOWERING WOMEN ACROSS INDIA</span>
            </div>
          </div>

          {/* ID, Role & Profile Layout */}
          <div className="flex justify-between items-start mb-4">
            
            {/* Left Col: ID & Role */}
            <div className="flex flex-col gap-4">
              
              {/* ID Box */}
              <div className="flex items-center gap-2">
                <div className="bg-[#D91656] text-white font-black text-lg w-10 h-10 flex items-center justify-center rounded-lg shadow-sm">
                  SH
                </div>
                <div className="flex flex-col justify-center h-10 border-b border-gray-200 pb-0.5">
                  <p className="text-[7px] font-bold text-gray-500 uppercase tracking-wide">ID NUMBER</p>
                  <p className="font-bold text-[#2C0A28] text-sm leading-tight">{displayId}</p>
                </div>
              </div>
              
              {/* Role Box */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full border border-[#D91656] flex items-center justify-center text-[#D91656]">
                  <User size={20} fill="currentColor" />
                </div>
                <div className="flex flex-col justify-center h-10">
                  <p className="text-[7px] font-bold text-gray-500 uppercase tracking-wide">ROLE</p>
                  <p className="font-bold text-[#D91656] text-sm leading-tight">{formattedRole}</p>
                </div>
              </div>

            </div>

            {/* Right Col: Photo Frame */}
            <div className="w-[85px] h-[105px] rounded-xl border border-red-300 overflow-hidden bg-gray-50 shadow-sm shrink-0">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User size={32} className="text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Name & Title */}
          <div className="text-center mb-4">
            <h2 className="text-sm font-black text-[#2C0A28] uppercase tracking-wide">{user.fullName}</h2>
            <p className="text-[#D91656] text-[10px] font-bold">{designation}</p>
          </div>

          {/* Details Table */}
          <div className="flex flex-col gap-1.5 text-[9px] relative z-20">
            {user.district && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><MapPin size={9} /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">District</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900 truncate">{user.district}</span>
              </div>
            )}
            {user.block && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><Building size={9} /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">Block/Tehsil</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900 truncate">{user.block}</span>
              </div>
            )}
            {user.state && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><MapPin size={9} /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">State</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900 truncate">{user.state}</span>
              </div>
            )}
            {user.pincode && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><MapPin size={9} /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">Pincode</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900 truncate">{user.pincode}</span>
              </div>
            )}
            {user.mobile && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><Phone size={9} /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">Mobile</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900">{user.mobile}</span>
              </div>
            )}
            {/* Display Blood Group only if available */}
            {user.bloodGroup && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><Droplet size={9} fill="currentColor" /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">Blood Group</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900">{user.bloodGroup}</span>
              </div>
            )}
            {user.joiningDate && (
              <div className="flex items-center">
                <div className="w-5 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><Calendar size={9} /></div></div>
                <span className="w-20 font-medium text-gray-700 ml-1">Date of Joining</span>
                <span className="px-1">:</span>
                <span className="font-bold text-gray-900">
                  {new Date(user.joiningDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Faded Background Logo Element on the Right */}
        <div className="absolute top-[50%] right-[-10px] w-48 opacity-10 pointer-events-none -z-0">
          <img src="/logo.png" alt="" className="w-full" />
        </div>

        {/* Bottom Verification & QR Section */}
        <div className="relative h-[115px] w-full flex flex-col justify-end mt-auto z-10">
          {/* Bottom Purple Curve Background */}
          <div className="absolute bottom-4 left-0 w-full h-[100px] -z-10">
             {/* Secondary Light Pink Curve Behind */}
             <svg viewBox="0 0 324 100" preserveAspectRatio="none" className="w-full h-full absolute bottom-0 left-0 scale-y-125 translate-y-2">
              <path d="M0,40 C120,0 240,40 324,20 L324,100 L0,100 Z" fill="#FCE4EC" />
            </svg>
            <svg viewBox="0 0 324 100" preserveAspectRatio="none" className="w-full h-full absolute bottom-0 left-0">
              <path d="M0,50 C150,0 250,50 324,20 L324,100 L0,100 Z" fill="#3B1C32" />
            </svg>
          </div>
          
          <div className="flex justify-between items-end px-5 pb-5">
            <div className="flex items-center gap-1.5 text-white mb-2">
              <div className="bg-white text-[#3B1C32] rounded-full p-0.5 shadow-sm"><ShieldCheck size={16} fill="currentColor" className="text-white bg-[#3B1C32] rounded-full" /></div>
              <div className="flex flex-col">
                <span className="text-[8px] font-bold leading-tight">Verified Member</span>
                <span className="text-[6px] text-white/80 leading-tight">This identity is officially<br/>verified by SakhiHub</span>
              </div>
            </div>
            
            {/* QR Code in White Box */}
            <div className="bg-white p-1 rounded-sm shadow-md mb-2">
              <QRCode value={verificationUrl} size={42} level="H" />
            </div>
          </div>

          {/* Bottom Red Strip */}
          <div className="bg-[#D91656] w-full py-1.5 text-center text-white text-[6px] font-bold tracking-[0.05em] uppercase z-20 h-[16px] flex items-center justify-center relative">
            SH – EMPOWERING COMMUNITY, EMPOWERING WOMEN
          </div>
        </div>

      </div>

      {/* ================= BACK SIDE ================= */}
      <div className="relative w-[324px] h-[513px] bg-white rounded-[20px] overflow-hidden shadow-2xl border border-gray-100 flex flex-col print:shadow-none print:border-gray-200 shrink-0">
        
        {/* Top Header Hole */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-2.5 rounded-full border border-gray-300 bg-white shadow-inner z-20"></div>

        {/* Top Header Curves matching Front */}
        <div className="absolute top-0 left-0 w-full h-[100px] z-0">
          <svg viewBox="0 0 324 100" preserveAspectRatio="none" className="w-full h-full absolute top-0 left-0">
            <path d="M0,0 L324,0 L324,50 C240,100 100,70 0,40 Z" fill="#FCE4EC" />
          </svg>
          <svg viewBox="0 0 324 100" preserveAspectRatio="none" className="w-full h-full absolute top-0 left-0">
            <path d="M0,0 L324,0 L324,40 C220,80 80,50 0,30 Z" fill="#D91656" />
          </svg>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 flex flex-col px-6 pt-12">
          
          <div className="text-center mb-3 mt-4">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="h-px w-10 bg-gray-300"></div>
              <h2 className="text-4xl font-black text-[#D91656] leading-none">SH</h2>
              <div className="h-px w-10 bg-gray-300"></div>
            </div>
            <h3 className="text-[10px] font-bold text-[#2C0A28] uppercase tracking-widest mt-1">SakhiHub Identity Card</h3>
          </div>

          <p className="text-[8px] text-center text-gray-700 px-4 mb-4 leading-relaxed font-medium">
            This card is issued to a verified member of<br/>SakhiHub. It is valid for official purposes only.
          </p>

          {/* Details Table */}
          <div className="flex flex-col gap-2.5 text-[9px] mb-4">
            <div className="flex items-center">
              <div className="w-6 flex justify-center"><div className="bg-[#D91656] text-white rounded-[2px] text-[6px] font-bold px-1 py-0.5 leading-none">SH</div></div>
              <span className="w-20 font-bold text-gray-800">ID Number</span>
              <span className="px-1">:</span>
              <span className="font-bold text-gray-900">{displayId}</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><User size={9} fill="currentColor" /></div></div>
              <span className="w-20 font-bold text-gray-800">Role</span>
              <span className="px-1">:</span>
              <span className="font-bold text-gray-900">{formattedRole}</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><User size={9} fill="currentColor" /></div></div>
              <span className="w-20 font-bold text-gray-800">Name</span>
              <span className="px-1">:</span>
              <span className="font-bold text-gray-900 truncate">{user.fullName}</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><Building size={9} fill="currentColor" /></div></div>
              <span className="w-20 font-bold text-gray-800">Organization</span>
              <span className="px-1">:</span>
              <span className="font-bold text-gray-900">{user.organizationName || 'SakhiHub'}</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 flex justify-center text-white"><div className="bg-[#D91656] p-0.5 rounded-sm"><Calendar size={9} /></div></div>
              <span className="w-20 font-bold text-gray-800">Valid Upto</span>
              <span className="px-1">:</span>
              <span className="font-bold text-gray-900">
                {user.joiningDate 
                  ? new Date(new Date(user.joiningDate).setFullYear(new Date(user.joiningDate).getFullYear() + 1)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200 mb-3"></div>

          {/* Terms and Conditions */}
          <div className="px-1 mb-4 flex-1">
            <h4 className="text-[9px] font-bold text-[#D91656] uppercase tracking-wider text-center mb-1.5">Terms & Conditions</h4>
            <ul className="text-[7.5px] text-gray-800 list-disc pl-4 space-y-1 font-medium pr-2">
              <li>This card is non-transferable.</li>
              <li>Use of this card is strictly for official SakhiHub work only.</li>
              <li>Misuse of this card may lead to disciplinary action.</li>
              <li>If found, please return to nearest SakhiHub office.</li>
            </ul>
          </div>

          {/* Signatures & Stamp */}
          <div className="flex justify-between items-end px-3 mt-auto pb-8 z-10 relative">
            <div className="flex flex-col items-center">
              <img src="/signature-placeholder.png" alt="Signature" className="h-6 opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="h-px w-20 bg-gray-400 mt-1 mb-1"></div>
              <span className="text-[7px] font-bold text-gray-700">Authorized Signatory</span>
            </div>
            <div className="relative mr-2">
              {/* Circular Stamp Mockup exactly like reference */}
              <div className="w-14 h-14 rounded-full border border-[#D91656] flex items-center justify-center p-0.5 opacity-90">
                <div className="w-full h-full rounded-full border border-[#D91656] flex flex-col items-center justify-center relative">
                  <svg viewBox="0 0 100 100" className="absolute w-full h-full text-[#D91656] animate-spin-slow" style={{ animationDuration: '20s' }}>
                    <path id="curve" d="M 15 50 A 35 35 0 1 1 85 50 A 35 35 0 1 1 15 50" fill="transparent" />
                    <text className="text-[12px] font-bold uppercase tracking-widest" fill="currentColor">
                      <textPath href="#curve" startOffset="25%" textAnchor="middle">SakhiHub</textPath>
                      <textPath href="#curve" startOffset="75%" textAnchor="middle">Verified</textPath>
                    </text>
                  </svg>
                  <img src="/logo.png" className="w-6 opacity-80" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Purple Strip */}
        <div className="bg-[#3B1C32] w-full py-1.5 px-4 flex justify-between items-center text-white mt-auto z-20 h-[22px] absolute bottom-0 left-0">
          <div className="flex items-center gap-1">
            <Globe size={8} />
            <span className="text-[7px] tracking-wide font-medium">www.sakhihub.com</span>
          </div>
          <div className="flex items-center gap-1">
            <PhoneCall size={8} />
            <span className="text-[7px] tracking-wide font-medium">Support: 8076611842</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityCard;
