import React from 'react'; 
import ImpactTicker from '@/components/features/home/ImpactTicker';
import PremiumHero from '@/components/features/home/PremiumHero';
import Impact from '@/components/features/home/Impact';
import WhatWeDo from '@/components/features/home/WhatWeDo';
import HowItWorks from '@/components/features/home/HowItWorks';
import TeamSection from '@/components/features/home/TeamSection';
import WhySakhiHub from '@/components/features/home/WhySakhiHub';
import LiveImpactMap from '@/components/features/home/LiveImpactMap';
import ProgramsPreview from '@/components/features/home/ProgramsPreview';
import ProjectsPreview from '@/components/features/home/ProjectsPreview';
import CTABanner from '@/components/features/home/CTABanner';

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

      {/* 8. Projects Preview (Social Initiatives) */}
      <ProjectsPreview />

      {/* 9. Live Impact Map (National Footprint) */}
      <LiveImpactMap />

      {/* 9. Programs Preview */}
      <ProgramsPreview />

      <CTABanner />
    </>
  );
}

