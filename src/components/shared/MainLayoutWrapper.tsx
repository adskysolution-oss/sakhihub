'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard routes where Navbar and Footer should be hidden
  const isDashboardRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/vendor') || 
    pathname.startsWith('/sub-vendor') || 
    pathname.startsWith('/employee') || 
    pathname.startsWith('/member') ||
    pathname.startsWith('/pending-assignment') ||
    pathname.startsWith('/pending-approval');

  if (isDashboardRoute) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
