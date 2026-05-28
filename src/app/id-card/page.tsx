'use client';

import React, { useEffect, useState } from 'react';
import IdentityCard from '@/components/shared/IdentityCard';
import { Printer, ChevronLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function IDCardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user details
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        
        const meData = await res.json();
        
        if (!meData || !meData.success || !meData.data) {
          router.push('/login');
          return;
        }

        const sessionUser = meData.data;
        const idToSearch = sessionUser.vendorCode || sessionUser.subVendorCode || sessionUser.employeeId || sessionUser._id;
        
        const verifyRes = await fetch(`/api/public/verify-id?id=${idToSearch}`);
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          const fetchedUser = verifyData.data;
          
          // Premium feature lock for members
          if (sessionUser.role === 'member') {
            const isPaidVerified = sessionUser.membershipType === 'paid' && (sessionUser.accessStatus === 'unlocked' || sessionUser.paymentStatus === 'completed');
            if (!isPaidVerified) {
              setUser({ premiumLocked: true });
              setLoading(false);
              return;
            }
          }
          
          setUser(fetchedUser);
        } else {
          // Premium feature lock for members
          if (sessionUser.role === 'member') {
            const isPaidVerified = sessionUser.membershipType === 'paid' && (sessionUser.accessStatus === 'unlocked' || sessionUser.paymentStatus === 'completed');
            if (!isPaidVerified) {
              setUser({ premiumLocked: true });
              setLoading(false);
              return;
            }
          }

          // Fallback if verify API fails
          setUser({
            fullName: sessionUser.fullName || 'User',
            role: sessionUser.role,
            idNumber: idToSearch,
            mobile: sessionUser.mobile,
          });
        }
      } catch (err) {
        console.error('Failed to load user ID data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-12 h-12 border-4 border-[#D91656] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
        <p className="text-gray-500 mb-4">Could not load ID Card details.</p>
        <Link href="/" className="text-[#D91656] font-bold">Return to Dashboard</Link>
      </div>
    );
  }

  if (user.premiumLocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-[25px] flex items-center justify-center text-amber-500 mb-6 border border-amber-100 shadow-inner">
          <AlertCircle size={36} />
        </div>
        <h2 className="text-3xl font-black text-[#2C0A28] mb-3">Premium Section Locked</h2>
        <p className="text-gray-500 font-bold mb-8 max-w-md mx-auto leading-relaxed">
          The Digital ID Card is a premium feature. Please upgrade your free membership or verify your pending payment to unlock.
        </p>
        <Link href="/member/dashboard" className="px-8 py-3.5 bg-[#D91656] text-white rounded-xl shadow-lg shadow-[#D91656]/30 font-bold hover:scale-105 transition-all">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-12 px-6 print:py-0 print:px-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Controls - Hidden when printing */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 print:hidden gap-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#D91656] transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <ChevronLeft size={16} /> Back
          </button>
          
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black text-[#2C0A28]">Your Official Identity Card</h1>
            <p className="text-sm text-gray-500 mt-1">Download or print your SakhiHub ID for official use.</p>
          </div>

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#D91656] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#D91656]/30 hover:bg-[#900C3F] transition-colors"
          >
            <Printer size={18} /> Print ID Card
          </button>
        </div>

        {/* Missing Profile Image Banner */}
        {!user.profileImage && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 print:hidden shadow-sm">
            <AlertCircle className="text-amber-500 shrink-0" size={24} />
            <div className="flex-1">
              <h4 className="font-bold text-amber-800 text-sm">Profile Picture Missing</h4>
              <p className="text-xs text-amber-700 mt-1">
                Your ID card currently doesn't have a profile picture. Please update your profile picture in the dashboard to generate a complete official ID card.
              </p>
            </div>
            <Link 
              href={`/${user.role.replace('_', '-')}/dashboard/profile`}
              className="px-5 py-2.5 bg-amber-500 text-white text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-amber-600 transition-all whitespace-nowrap shrink-0 shadow-md shadow-amber-500/20"
            >
              Update Profile
            </Link>
          </div>
        )}

        {/* ID Card Display */}
        <div className="flex justify-center print:block print:w-fit print:mx-auto">
          <IdentityCard user={user} />
        </div>

        {/* Print instructions - Hidden when printing */}
        <div className="mt-12 max-w-2xl mx-auto bg-blue-50 border border-blue-100 p-6 rounded-2xl text-sm text-blue-800 print:hidden">
          <h4 className="font-bold mb-2 flex items-center gap-2">🖨️ Printing Instructions:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>For the best quality, set your printer to print in <strong>Color</strong>.</li>
            <li>Enable <strong>"Background graphics"</strong> in your print dialog so colors and shapes render correctly.</li>
            <li>Set margins to <strong>"None"</strong> or <strong>"Minimum"</strong>.</li>
            <li>Scale to 100% (do not use "Fit to page" if you want the exact physical dimensions).</li>
          </ul>
        </div>

      </div>
      
      {/* Print Specific Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          /* Ensure the container doesn't force a weird height or break layout */
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Center the cards exactly at the top of the A4 page */
          .max-w-4xl {
            width: 100% !important;
            max-width: none !important;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 1cm;
            margin: 0 auto;
          }
        }
      `}} />
    </div>
  );
}
