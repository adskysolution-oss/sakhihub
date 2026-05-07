'use client';

import RegisterBranding from "@/components/features/auth/RegisterBranding";
import RegisterForm from "@/components/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', background: '#fff' }}>
      {/* Left: Branding */}
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <RegisterBranding />
      </div>

      {/* Right: Form */}
      <div style={{ background: 'white', padding: '80px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
        <RegisterForm />
      </div>
      
      {/* Mobile-responsive helper is handled via standard media queries in globals.css or can be done via inline logic if needed. */}
    </main>
  );
}

