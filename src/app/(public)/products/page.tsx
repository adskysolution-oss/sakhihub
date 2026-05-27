'use client';

import PageBanner from "@/components/ui/PageBanner";
import React, { useState, useEffect } from "react";
import { CheckCircle2, ShoppingBag, ShieldCheck, Zap, ArrowRight, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import axios from "axios";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductsPage() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/products');
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch public products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [language]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  // Extract first 3 product images for the banner slider
  const bannerImages = products
    .slice(0, 3)
    .map((p: any) => p.posterImage)
    .filter(Boolean);

  const displayBannerImages = bannerImages.length > 0 ? bannerImages : [
    "/images/campaign_sanitary.png",
    "/images/product.png",
    "/images/Hygiene-Education.jpeg"
  ];

  return (
    <div className="bg-[#FFF5F8] min-h-screen overflow-x-hidden">
      <PageBanner
        title={t('productsPage.title')}
        subtitle={t('productsPage.subtitle')}
        images={displayBannerImages}
      />

      {/* Product List */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 lg:mb-24">
            <span className="text-primary font-bold uppercase tracking-[2px] text-xs sm:text-sm">{t('productsPage.careTrust')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-secondary mt-4 leading-tight">{t('productsPage.premium')} <span className="text-gradient">{t('productsPage.qualityProd')}</span></h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-[40px] aspect-[4/5] animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-soft max-w-2xl mx-auto p-10">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-6">
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-2xl font-black text-secondary">{t('productsPage.noProd')}</h3>
              <p className="text-gray-400 font-bold mt-2">{t('productsPage.noProdDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  {...fadeInUp}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 border border-gray-100 flex flex-col transition-all"
                >
                  <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-gray-50 shrink-0">
                    {product.posterImage ? (
                      <img src={product.posterImage} alt={product.title} className="w-full h-full object-cover transition-transform duration-75 hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ShoppingBag size={64} />
                      </div>
                    )}
                  </div>
                  <div className="p-8 sm:p-12 flex flex-col flex-1">
                    <div className="mb-6">
                      <h3 className="text-2xl sm:text-3xl font-black text-secondary mb-2 hover:text-primary transition-colors">
                        <Link href={`/products/${product.slug}`} className="no-underline text-inherit">
                          {product.title}
                        </Link>
                      </h3>
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        {product.highlights?.[0] || t('productsPage.premiumQual')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-base sm:text-lg line-through text-gray-300 font-medium">{t('productsPage.mrp')}{product.mrp}</span>
                      <div className="bg-primary/5 px-5 py-2.5 rounded-2xl flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-black text-primary tracking-tight">{t('productsPage.offer')}{product.offerPrice} {t('productsPage.only')}</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 font-medium line-clamp-3">
                      {product.shortDescription}
                    </p>

                    {product.highlights && product.highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                        {product.highlights.slice(0, 4).map((h: string) => (
                          <div key={h} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-600">
                            <CheckCircle2 size={16} className="text-primary shrink-0" />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex flex-col sm:flex-row gap-4">
                      <Link href={`/products/${product.slug}`} className="flex-1 flex items-center justify-center gap-3 bg-secondary text-white hover:bg-secondary/90 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                        {t('productsPage.viewDetails')}
                      </Link>
                      <Link href="/contact" className="flex-1 flex items-center justify-center gap-3 bg-primary text-white hover:bg-primary/90 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all">
                        <ShoppingCart size={16} /> {t('productsPage.inquiry')}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="section-padding bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { title: t('productsPage.safeTitle'), desc: t('productsPage.safeDesc'), icon: ShieldCheck },
              { title: t('productsPage.absTitle'), desc: t('productsPage.absDesc'), icon: Zap },
              { title: t('productsPage.affTitle'), desc: t('productsPage.affDesc'), icon: Heart }
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
      <section className="py-20 lg:py-32 bg-[#FFF5F8]">
        <div className="container mx-auto px-6">
          <div className="bg-secondary rounded-[40px] lg:rounded-[60px] p-8 sm:p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <ShoppingBag size={120} className="absolute top-0 right-0 opacity-10 -translate-y-1/3 translate-x-1/3 rotate-12" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 leading-tight max-w-3xl mx-auto">{t('productsPage.bulkTitle')}</h2>
            <p className="text-base sm:text-lg lg:text-xl opacity-80 max-w-2xl mx-auto mb-12 lg:mb-16 font-medium leading-relaxed">
              {t('productsPage.bulkDesc')}
            </p>
            <Link href="/contact" className="inline-flex items-center justify-center gap-4 bg-white text-secondary hover:bg-primary hover:text-white py-5 px-10 sm:px-16 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl transition-all">
              {t('productsPage.bulkBtn')} <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
