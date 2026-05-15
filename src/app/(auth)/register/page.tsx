'use client';

import RegisterBranding from "@/components/features/auth/RegisterBranding";
import RegisterForm from "@/components/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.1fr_0.8fr] bg-white">
      {/* Left: Branding - Sticky on desktop, flow on mobile */}
      <div className="relative lg:sticky lg:top-0 lg:h-screen overflow-hidden">
        <RegisterBranding />
      </div>

      {/* Right: Form - Scrollable area */}
      <div className="bg-white py-12 px-4 md:py-20 md:px-12 lg:px-20 flex items-center justify-center overflow-y-auto">
        <RegisterForm />
      </div>
    </main>
  );
}

