import React from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { IndianRupee, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy | SakhiHub',
  description: 'Understand the refund and cancellation policy for payments and security deposits on SakhiHub.',
};

export default function RefundPolicy() {
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
            <RefreshCw size={14} className="text-primary" /> Financial Clarity
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Refund <span className="text-primary">Policy</span></h1>
          <p className="text-white/60 font-bold max-w-2xl mx-auto uppercase tracking-widest text-xs">Last Updated: May 11, 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-slate prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-12">
              <p className="text-secondary font-bold leading-relaxed mb-0">
                This Refund Policy outlines the terms and conditions for refunds related to security deposits and membership fees on the SakhiHub platform. Our goal is to maintain transparency and fairness in all financial transactions.
              </p>
            </div>

            <div className="space-y-12 text-gray-600">
              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">01</span>
                  Security Deposits (Vendors)
                </h2>
                <p className="leading-relaxed mb-4">
                  Vendors paying security deposits for specific campaigns are eligible for refunds under the following conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Campaign Completion:</strong> Deposits are typically refundable after the successful completion and audit of the assigned campaign goals.</li>
                  <li><strong>Cancellation:</strong> If a campaign is cancelled by SakhiHub before commencement, the full security deposit will be refunded.</li>
                  <li><strong>Partial Refund:</strong> In case of early termination by the Vendor, the refund amount will be calculated based on the progress made and the specific campaign agreement.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">02</span>
                  Membership Fees (Members)
                </h2>
                <p className="leading-relaxed mb-4">
                  Membership fees paid by women members for premium services or kit distribution are subject to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>3-Day cooling period:</strong> Members can request a full refund within 3 days of payment if no services have been utilized or kits received.</li>
                  <li><strong>Non-refundable:</strong> Fees are non-refundable once the member has participated in a campaign or received physical benefits/kits.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">03</span>
                  Refund Processing Timeline
                </h2>
                <p className="leading-relaxed">
                  Once a refund request is approved, the amount will be processed back to the original payment method. The typical timeline for the amount to reflect in your account is <strong>5-7 business days</strong>, depending on your bank's processing time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">04</span>
                  Cancellation Policy
                </h2>
                <p className="leading-relaxed">
                  Users can cancel their participation in a campaign at any time. However, cancellations made after certain milestones or resource allocations may attract a cancellation fee, which will be deducted from the security deposit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">05</span>
                  How to Request a Refund
                </h2>
                <p className="leading-relaxed mb-4">
                  To initiate a refund request, please follow these steps:
                </p>
                <ol className="list-decimal pl-6 space-y-2 mt-4">
                  <li>Login to your SakhiHub dashboard.</li>
                  <li>Navigate to the 'Payments' or 'Finance' section.</li>
                  <li>Select the transaction and click on 'Raise Refund Request'.</li>
                  <li>Alternatively, email us at info@sakhihub.com with your Transaction ID and reason for refund.</li>
                </ol>
              </section>

              <section>
                <h2 className="text-2xl font-black text-secondary flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base">06</span>
                  Exceptions
                </h2>
                <p className="leading-relaxed">
                  Refunds will not be processed in cases of fraudulent activity, breach of the platform's Terms and Conditions, or failure to meet the minimum quality standards for campaign implementation.
                </p>
              </section>
            </div>

            <div className="mt-16 p-10 bg-secondary rounded-[40px] text-white text-center">
              <h3 className="text-2xl font-black mb-4">Payment Issues?</h3>
              <p className="text-white/60 mb-8 font-bold text-sm">Our finance team is here to help you. Reach out to info@sakhihub.com</p>
              <a href="mailto:info@sakhihub.com" className="inline-flex px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">Raise Support Ticket</a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
