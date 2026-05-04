"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download, ChevronLeft, ChevronRight, Share2, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PresentationPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const slidesRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      id: 1,
      title: "महिला स्वास्थ्य एवं स्वच्छता जागरूकता अभियान",
      subtitle: "Sakhi Hub द्वारा संचालित",
      tagline: "🌸 स्वस्थ महिला – सशक्त परिवार – समृद्ध भारत 🌸",
      type: "hero",
      bg: "linear-gradient(135deg, #FFE4EC 0%, #FFF0F5 50%, #FFE4EC 100%)",
    },
    {
      id: 2,
      title: "हमारा उद्देश्य (Our Mission)",
      content: [
        "ग्रामीण और शहरी क्षेत्रों में महिलाओं को स्वास्थ्य के प्रति जागरूक करना।",
        "मासिक धर्म स्वच्छता (Menstrual Hygiene) से जुड़ी वर्जनाओं को खत्म करना।",
        "सस्ती और उच्च गुणवत्ता वाली स्वच्छता सामग्री उपलब्ध कराना।",
        "महिलाओं को आत्मनिर्भर और सशक्त बनाना।"
      ],
      image: "/images/empowerment.png",
      type: "content",
    },
    {
      id: 3,
      title: "प्रमुख क्षेत्र (Key Focus Areas)",
      content: [
        "स्वास्थ्य शिविर और कार्यशालाएं",
        "स्वच्छता किट वितरण",
        "कौशल विकास और रोजगार",
        "निरंतर परामर्श और सहायता"
      ],
      image: "/images/campaign_health.png",
      type: "grid",
    },
    {
      id: 4,
      title: "साखी केयर (Sakhi Care)",
      subtitle: "आपकी स्वच्छता, हमारी प्राथमिकता",
      content: [
        "100% सुरक्षित और आरामदायक पैड्स।",
        "बेहतर सोखने की क्षमता।",
        "त्वचा के अनुकूल (Skin Friendly) सामग्री।",
        "उचित मूल्य पर उपलब्ध।"
      ],
      image: "/images/campaign_sanitary.png",
      type: "product",
    },
    {
      id: 5,
      title: "सम्पर्क करें (Contact Us)",
      subtitle: "Sakhi Hub - हर महिला तक सही जानकारी पहुंचाना",
      content: [
        "वेबसाइट: www.sakhihub.com",
        "ईमेल: contact@sakhihub.com",
        "फोन: +91 XXXXXXXXXX",
        "पता: [Your Office Address]"
      ],
      image: "/images/hero_join_movement.png",
      type: "contact",
    }
  ];

  const handleDownloadPDF = async () => {
    if (!slidesRef.current) return;
    setIsGenerating(true);

    try {
      const pdf = new jsPDF('l', 'px', [1280, 720]);
      const slidesElements = slidesRef.current.querySelectorAll('.slide-content');

      for (let i = 0; i < slidesElements.length; i++) {
        const element = slidesElements[i] as HTMLElement;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage([1280, 720], 'l');
        pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
      }

      pdf.save('Sakhi-Hub-Campaign-Presentation.pdf');
    } catch (error) {
      console.error("PDF Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-pink-500 selection:text-white">
      {/* Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Sakhi Hub Presentation</h1>
            <p className="text-xs text-gray-400">Campaign Awareness Deck</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-800 rounded-full px-4 py-1.5 gap-4 border border-white/10">
            <button onClick={prevSlide} className="hover:text-pink-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium tabular-nums">
              {currentSlide + 1} / {slides.length}
            </span>
            <button onClick={nextSlide} className="hover:text-pink-400 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg ${
              isGenerating 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-105 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Download size={18} />
            )}
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Slide Container (Viewport) */}
      <div className="pt-24 pb-12 flex justify-center items-center overflow-hidden px-4">
        <div className="relative shadow-2xl rounded-xl overflow-hidden border border-white/5" style={{ width: '1280px', height: '720px' }}>
          <div 
            className="flex transition-transform duration-700 ease-in-out" 
            style={{ transform: `translateX(-${currentSlide * 100}%)`, width: `${slides.length * 100}%` }}
          >
            {slides.map((slide, idx) => (
              <div key={slide.id} className="w-full flex-shrink-0" style={{ height: '720px' }}>
                 {/* This is the element captured by html2canvas */}
                <div 
                  className="slide-content w-full h-full relative flex flex-col items-center justify-center p-12 overflow-hidden bg-white"
                  style={{ background: slide.bg || '#fff' }}
                >
                  {/* Decorative Elements for all slides */}
                  <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-100/50 blur-3xl opacity-60" />
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-100/50 blur-3xl opacity-60" />
                  
                  {/* Header Bar for Slide */}
                  <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-[#E91E8C] to-[#6B21A8] flex items-center justify-between px-10">
                    <span className="text-white font-semibold text-xl tracking-wide">🌸 Sakhi Hub - महिला स्वास्थ्य अभियान</span>
                    <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
                  </div>

                  {/* Content Layouts */}
                  {slide.type === 'hero' && (
                    <div className="text-center mt-10 z-10">
                      <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        animate={currentSlide === idx ? { opacity: 1, y: 0 } : {}}
                        className="text-6xl font-extrabold text-[#6B21A8] leading-tight mb-6"
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={currentSlide === idx ? { opacity: 1 } : {}}
                        transition={{ delay: 0.3 }}
                        className="text-3xl text-[#E91E8C] font-semibold mb-10"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={currentSlide === idx ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="inline-block bg-white shadow-xl px-12 py-6 rounded-full border-2 border-pink-100"
                      >
                        <span className="text-4xl font-bold text-[#4A148C]">{slide.tagline}</span>
                      </motion.div>

                      <div className="mt-16 flex gap-12 justify-center">
                         <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 w-72">
                            <img src="https://www.genspark.ai/api/files/s/ihfMhY66" className="h-16 w-16 object-contain" alt="" />
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-lg">Sakhi Hub</p>
                                <p className="text-gray-500 text-sm">महिला स्वास्थ्य केंद्र</p>
                            </div>
                         </div>
                         <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 w-72">
                            <img src="https://www.genspark.ai/api/files/s/4bo1HUX0" className="h-16 w-16 object-contain" alt="" />
                            <div className="text-left">
                                <p className="font-bold text-gray-800 text-lg">Sakhi Care</p>
                                <p className="text-gray-500 text-sm">स्वच्छता उत्पाद</p>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {slide.type !== 'hero' && (
                    <div className="flex w-full h-full pt-16 items-center gap-12 z-10">
                        <div className="flex-1 text-left space-y-8">
                            <motion.h2 
                                initial={{ opacity: 0, x: -30 }}
                                animate={currentSlide === idx ? { opacity: 1, x: 0 } : {}}
                                className="text-5xl font-extrabold text-[#6B21A8] border-l-8 border-pink-500 pl-6"
                            >
                                {slide.title}
                            </motion.h2>
                            {slide.subtitle && (
                                <p className="text-2xl text-pink-600 font-semibold">{slide.subtitle}</p>
                            )}
                            <ul className="space-y-4">
                                {slide.content?.map((item, k) => (
                                    <motion.li 
                                        key={k}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={currentSlide === idx ? { opacity: 1, x: 0 } : {}}
                                        transition={{ delay: 0.2 + (k * 0.1) }}
                                        className="flex items-start gap-4 text-2xl text-gray-700 font-medium"
                                    >
                                        <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 mt-1">
                                            ✓
                                        </span>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={currentSlide === idx ? { opacity: 1, scale: 1 } : {}}
                            className="flex-1 h-[450px] relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                        >
                            <img 
                                src={slide.image} 
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </motion.div>
                    </div>
                  )}

                  {/* Footer Bar for Slide */}
                  <div className="absolute bottom-0 left-0 w-full h-14 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-6">
                    <img src="https://www.genspark.ai/api/files/s/M6bmsqE4" alt="Footer Logo" className="h-8" />
                    <span className="text-gray-500 font-medium text-lg italic">
                        Sakhi Hub - हर महिला तक सही जानकारी पहुंचाना
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-sm flex gap-6">
        <span className="flex items-center gap-2"><kbd className="bg-gray-800 px-2 py-1 rounded">←</kbd> Previous</span>
        <span className="flex items-center gap-2"><kbd className="bg-gray-800 px-2 py-1 rounded">→</kbd> Next</span>
        <span className="flex items-center gap-2"><kbd className="bg-gray-800 px-2 py-1 rounded">PDF</kbd> Auto Capture</span>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap');
        
        body {
          font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
        }

        .slide-content {
           page-break-after: always;
        }
      `}</style>
    </div>
  );
};

export default PresentationPage;
