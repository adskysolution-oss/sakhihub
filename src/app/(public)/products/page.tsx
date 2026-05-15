'use client';

import PageBanner from "@/components/ui/PageBanner";
import React from "react";
import { CheckCircle2, MessageCircle, Phone, Info, ShoppingBag, Star, ShieldCheck, Zap, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const products = [
  {
    name: "Sakhi Care Pads - Regular Pack",
    size: "16 Pads (Regular + XL)",
    mrp: 100,
    offer: 80,
    tag: "Most Popular",
    details: "Perfect for daily comfort and high activity days.",
    features: ["Soft Cottony Surface", "Advanced Absorbency", "Anti-Leak Side Walls", "Skin-Safe & Breathable"],
    image: "/images/product.png"
  },
  {
    name: "Sakhi Care Pads - Family Pack",
    size: "24 Pads (XL + XXL)",
    mrp: 150,
    offer: 120,
    tag: "Best Value",
    details: "All-day and overnight protection for the whole family.",
    features: ["Extra Large Coverage", "Dual-Layer Protection", "Zero Leakage Tech", "Night-Use Optimized", "Eco-Friendly Design"],
    image: "/images/Hygiene-Education.jpeg"
  }
];

export default function ProductsPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      <PageBanner 
        title="Premium Products" 
        subtitle="Sakhi Care: High-quality hygiene solutions at accessible prices."
        images={[
          "/images/campaign_sanitary.png",
          "/images/product.png",
          "/images/Hygiene-Education.jpeg"
        ]}
      />
      
      {/* Product Highlight */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center mb-12 lg:mb-24">
            <span className="text-primary font-bold uppercase tracking-[2px] text-xs sm:text-sm">Care You Can Trust</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mt-4 leading-tight">Premium <span className="text-gradient">Quality</span> Products</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {products.map((product, idx) => (
              <motion.div 
                key={idx} 
                {...fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 relative flex flex-col transition-all"
              >
                {product.tag && (
                  <div className="absolute top-5 right-5 bg-gradient-to-br from-primary to-secondary text-white px-5 py-2 rounded-full font-bold text-[10px] sm:text-xs z-10 shadow-lg">
                    {product.tag}
                  </div>
                )}
                <div className="h-64 sm:h-80 lg:h-96 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                </div>
                <div className="p-8 sm:p-12 flex flex-col flex-1">
                  <div className="mb-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">{product.name}</h3>
                    <p className="text-primary font-bold text-xs sm:text-sm uppercase tracking-widest">{product.size}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <span className="text-lg sm:text-xl line-through text-gray-300 font-medium">MRP ₹{product.mrp}</span>
                    <div className="bg-primary/5 px-6 py-3 rounded-2xl">
                       <span className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Offer ₹{product.offer}</span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-10 font-medium">
                    {product.details}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    {product.features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-700">
                        <CheckCircle2 size={16} className="text-primary shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Link href="/contact" className="flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary/90 py-5 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-primary/20 transition-all">
                      <Info size={20} /> Inquiry for Purchase
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="section-padding bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { title: "Safe for Skin", desc: "Dermatologically tested to ensure zero irritation and maximum comfort.", icon: ShieldCheck },
              { title: "High Absorbency", desc: "Multi-layer technology that locks in fluid instantly for a dry feel.", icon: Zap },
              { title: "Affordable Care", desc: "Premium hygiene shouldn't be expensive. We keep it reachable.", icon: Heart }
            ].map((item, i) => (
              <motion.div key={i} {...fadeInUp} className="text-center p-8 lg:p-10 bg-white rounded-[40px] shadow-xl shadow-black/5 border border-white hover:border-primary/20 transition-all">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-black/[0.02]">
                  <item.icon size={36} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-4">{item.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Inquiry CTA */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="bg-secondary rounded-[40px] lg:rounded-[60px] p-8 sm:p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
             <ShoppingBag size={120} className="absolute top-0 right-0 opacity-10 -translate-y-1/3 translate-x-1/3 rotate-12" />
             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight max-w-3xl mx-auto">Bulk Inquiry for NGOs & Distributors</h2>
             <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto mb-12 lg:mb-16 font-medium leading-relaxed">
               Partner with us for bulk supplies or distribution opportunities in your region. 
               Let's make quality hygiene products available to every woman.
             </p>
             <Link href="/contact" className="inline-flex items-center justify-center gap-4 bg-white text-secondary hover:bg-primary hover:text-white py-5 px-10 sm:px-16 rounded-full font-bold text-base sm:text-lg shadow-2xl transition-all">
               Inquiry for Partnership <ArrowRight size={22} />
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

