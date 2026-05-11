import React from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Lock, Eye, Database, Shield } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | SakhiHub',
  description: 'Learn how SakhiHub collects, uses, and protects your personal data.',
};

export default function PrivacyPolicy() {
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
            <Lock size={14} className="text-primary" /> Data Protection
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Privacy <span className="text-primary">Policy</span></h1>
          <p className="text-white/60 font-bold max-w-2xl mx-auto uppercase tracking-widest text-xs">Last Updated: May 11, 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-12">
              <p className="text-secondary font-bold leading-relaxed mb-0">
                At SakhiHub, accessible from www.sakhihub.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by SakhiHub and how we use it.
              </p>
            </div>

            <div className="space-y-12 text-gray-600">
              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">01</span>
                  Information We Collect
                </h2>
                <p className="leading-relaxed mb-4">
                  We collect personal information that you voluntarily provide to us when you register on the platform, participate in campaigns, or contact us. This may include:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Identity Data:</strong> Full name, Aadhaar number, PAN number, and profile images.</li>
                  <li><strong>Contact Data:</strong> Mobile number, WhatsApp number, email address, and residential/office address.</li>
                  <li><strong>Hierarchy Data:</strong> Vendor codes, employee IDs, and recruitment mapping.</li>
                  <li><strong>Financial Data:</strong> Details related to security deposits and campaign payments.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">02</span>
                  How We Use Your Information
                </h2>
                <p className="leading-relaxed mb-4">
                  The information we collect is used in the following ways:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide, operate, and maintain our platform and hierarchy system.</li>
                  <li>To improve, personalize, and expand our platform services.</li>
                  <li>To understand and analyze how you use our platform.</li>
                  <li>To develop new products, services, features, and functionality.</li>
                  <li>To communicate with you, either directly or through one of our partners, for customer service, updates, and marketing purposes.</li>
                  <li>To process your transactions and manage security deposits.</li>
                  <li>To find and prevent fraud.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">03</span>
                  Cookies and Web Beacons
                </h2>
                <p className="leading-relaxed">
                  Like any other website, SakhiHub uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">04</span>
                  Data Protection & Security
                </h2>
                <p className="leading-relaxed">
                  We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. In addition, all sensitive/credit information you supply is encrypted via Secure Socket Layer (SSL) technology.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">05</span>
                  Third-Party Privacy Policies
                </h2>
                <p className="leading-relaxed">
                  SakhiHub's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">06</span>
                  Children's Information
                </h2>
                <p className="leading-relaxed">
                  Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. SakhiHub does not knowingly collect any Personal Identifiable Information from children under the age of 13.
                </p>
              </section>
            </div>

            <div className="mt-16 p-10 bg-secondary rounded-[40px] text-white text-center">
              <h3 className="text-2xl font-black mb-4">Privacy Concerns?</h3>
              <p className="text-white/60 mb-8 font-bold text-sm">We take your data seriously. Reach out to info@sakhihub.com</p>
              <a href="mailto:info@sakhihub.com" className="inline-flex px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">Email Data Officer</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
