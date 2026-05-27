'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, CheckCircle2, ArrowRight,
  Heart, ShieldCheck, ShoppingCart, Info, ShoppingBag, Users2
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products?slug=${params.slug}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch product details", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchProduct();
  }, [params.slug, language]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF5F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#FFF5F8] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-secondary mb-4">{t('productsPage.notFound')}</h1>
        <p className="text-gray-400 font-bold mb-8">{t('productsPage.notFoundDesc')}</p>
        <Link href="/products" className="btn-primary px-8 py-4">{t('productsPage.backToProd')}</Link>
      </main>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <main className="min-h-screen bg-[#FFF5F8] pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-6xl mt-10">
        
        {/* Back Link */}
        <div className="mb-10">
          <Link href="/products" className="text-xs font-black text-primary uppercase tracking-widest hover:pl-2 transition-all flex items-center gap-2">
            {t('productsPage.backToAll')}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image and Pricing Card */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl p-6 relative"
            >
              <div className="aspect-square bg-gray-50 rounded-[32px] overflow-hidden mb-6 flex items-center justify-center">
                {product.posterImage ? (
                  <img src={product.posterImage} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag size={80} className="text-gray-200" />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-base line-through text-gray-300 font-bold">{t('productsPage.mrp')}{product.mrp}</span>
                  <div className="bg-primary/5 px-5 py-2.5 rounded-2xl flex-1 text-center">
                    <span className="text-2xl font-black text-primary tracking-tight">{t('productsPage.offer')}{product.offerPrice} {t('productsPage.only')}</span>
                  </div>
                </div>

                <Link href="/contact" className="w-full flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary/90 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all">
                  <ShoppingCart size={18} /> {t('productsPage.inquiryPurch')}
                </Link>
              </div>
            </motion.div>

            {/* Support Information Box */}
            <div className="p-6 bg-secondary text-white rounded-[32px] shadow-lg">
              <h5 className="text-xs font-black uppercase tracking-widest mb-2">{t('productsPage.bulkPurchases')}</h5>
              <p className="text-xs text-white/70 font-medium leading-relaxed mb-4">
                {t('productsPage.bulkPurchDesc')}
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                {t('productsPage.contactSales')} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Detailed Product Specifications */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest shadow-sm">
                <Sparkles size={14} /> Sakhi Care Premium
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-secondary leading-tight">
                {product.title}
              </h1>

              <p className="text-lg text-gray-500 font-bold leading-relaxed italic">
                {product.shortDescription}
              </p>
            </motion.div>

            <hr className="border-gray-200" />

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <motion.div {...fadeInUp} className="bg-white p-8 sm:p-10 rounded-[36px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-secondary mb-6 flex items-center gap-3">
                  <CheckCircle2 size={22} className="text-primary" /> {t('productsPage.highlights')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.highlights.map((h: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-sm text-gray-600 font-bold leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <motion.div {...fadeInUp} className="bg-white p-8 sm:p-10 rounded-[36px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-secondary mb-6 flex items-center gap-3">
                  <Heart size={22} className="text-primary" /> {t('productsPage.benefits')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.benefits.map((b: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Heart size={12} />
                      </div>
                      <span className="text-sm text-gray-600 font-bold leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <motion.div {...fadeInUp} className="bg-white p-8 sm:p-10 rounded-[36px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-secondary mb-6 flex items-center gap-3">
                  <ShieldCheck size={22} className="text-primary" /> {t('productsPage.features')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.features.map((f: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck size={12} />
                      </div>
                      <span className="text-sm text-gray-600 font-bold leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Best For */}
            {product.bestFor && product.bestFor.length > 0 && (
              <motion.div {...fadeInUp} className="bg-white p-8 sm:p-10 rounded-[36px] shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-secondary mb-6 flex items-center gap-3">
                  <Users2 size={22} className="text-primary" /> {t('productsPage.bestFor')}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.bestFor.map((bf: string, i: number) => (
                    <div key={i} className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={14} className="text-primary" /> {bf}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}
