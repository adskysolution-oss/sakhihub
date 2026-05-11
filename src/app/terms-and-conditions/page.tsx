import React from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions | SakhiHub',
  description: 'Read the terms and conditions for using the SakhiHub platform.',
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
            <ShieldCheck size={14} className="text-primary" /> Legal Framework
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Terms and <span className="text-primary">Conditions</span></h1>
          <p className="text-white/60 font-bold max-w-2xl mx-auto uppercase tracking-widest text-xs">Last Updated: May 11, 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-12">
              <p className="text-secondary font-bold leading-relaxed mb-0">
                Welcome to SakhiHub. These terms and conditions outline the rules and regulations for the use of SakhiHub's Website and Platform. By accessing this website we assume you accept these terms and conditions. Do not continue to use SakhiHub if you do not agree to take all of the terms and conditions stated on this page.
              </p>
            </div>

            <div className="space-y-12 text-gray-600">
              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">01</span>
                  Platform Usage
                </h2>
                <p className="leading-relaxed mb-4">
                  SakhiHub provides a platform for women empowerment through health awareness, education, and economic opportunities. Users include Admin, Vendors, Sub-Vendors, Employees, and Members. Access to specific features depends on the user's role and approval status.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Users must provide accurate and complete information during registration.</li>
                  <li>Account security is the responsibility of the user.</li>
                  <li>SakhiHub reserves the right to terminate accounts for any violation of policies.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">02</span>
                  Role-Based Responsibilities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <h4 className="font-black text-secondary mb-2 uppercase text-xs tracking-widest text-primary">Vendors & Sub-Vendors</h4>
                    <p className="text-sm leading-relaxed">Responsible for managing their respective recruitment hierarchies and ensuring the integrity of the campaigns they participate in.</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <h4 className="font-black text-secondary mb-2 uppercase text-xs tracking-widest text-primary">Field Staff (Employees)</h4>
                    <p className="text-sm leading-relaxed">Responsible for ground-level implementation, member verification, and maintaining regular activity logs in the dashboard.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">03</span>
                  Campaign Participation
                </h2>
                <p className="leading-relaxed">
                  Participation in campaigns (Health Awareness, Distribution, etc.) is subject to approval. Vendors may be required to pay a security deposit for certain high-value campaigns. All activities must be documented within the SakhiHub dashboard for transparency.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">04</span>
                  Payments & Security Deposits
                </h2>
                <p className="leading-relaxed">
                  All financial transactions on the platform are processed through secure payment gateways. Security deposits paid by Vendors are subject to the specific campaign agreement terms and the Refund Policy of SakhiHub.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">05</span>
                  Prohibited Activities
                </h2>
                <p className="leading-relaxed">
                  Users are prohibited from:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Providing false identity or falsifying campaign data.</li>
                  <li>Collecting unauthorized fees from members.</li>
                  <li>Using the platform for any illegal activities or harassment.</li>
                  <li>Attempting to bypass the hierarchical approval system.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">06</span>
                  Liability & Indemnity
                </h2>
                <p className="leading-relaxed">
                  SakhiHub is not liable for any indirect or consequential losses resulting from platform use. Users agree to indemnify SakhiHub against any claims arising from their misuse of the platform or breach of these terms.
                </p>
              </section>
            </div>

            <div className="mt-16 p-10 bg-secondary rounded-[40px] text-white text-center">
              <h3 className="text-2xl font-black mb-4">Questions about our Terms?</h3>
              <p className="text-white/60 mb-8 font-bold text-sm">Contact our legal team at info@sakhihub.com</p>
              <a href="mailto:info@sakhihub.com" className="inline-flex px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">Contact Legal Support</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
