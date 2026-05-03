import React from 'react';
import ImpactTicker from '@/components/home/ImpactTicker';
import PremiumHero from '@/components/home/PremiumHero';
import Impact from '@/components/home/Impact';
import WhatWeDo from '@/components/home/WhatWeDo';
import HowItWorks from '@/components/home/HowItWorks';
import TeamSection from '@/components/home/TeamSection';
import WhySakhiHub from '@/components/home/WhySakhiHub';
import LiveImpactMap from '@/components/home/LiveImpactMap';
import ProgramsPreview from '@/components/home/ProgramsPreview';
import CTABanner from '@/components/home/CTABanner';

export default function Home() {
  return (
    <>
      {/* Real-time Updates Ticker */}
      <ImpactTicker />

      {/* 1. Premium Hero */}
      <PremiumHero />

      {/* 2. Impact Stats (with Background Image) */}
      <Impact />

      {/* 3. Core Work (6 Cards with Realistic Images) */}
      <WhatWeDo />

      {/* 4. How It Works (Cinematic Step Flow) */}
      <HowItWorks />

      {/* 5 & 6. Real Impact Stories & Workforce (Combined in TeamSection) */}
      <TeamSection />

      {/* 7. Why SakhiHub (Premium Image Cards) */}
      <WhySakhiHub />

      {/* 8. Live Impact Map (National Footprint) */}
      <LiveImpactMap />

      {/* 9. Programs Preview */}
      <ProgramsPreview />

      {/* 10. Big CTA Banner */}
      <CTABanner />

      <div style={{ height: '80px' }}></div>
    </>
  );
}
