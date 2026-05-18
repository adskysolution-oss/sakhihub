'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmployeeMembershipPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/employee/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-soft max-w-md">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Redirecting...</p>
      </div>
    </div>
  );
}
