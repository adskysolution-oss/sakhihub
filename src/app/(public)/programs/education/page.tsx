'use client';

import React from 'react';
import PageBanner from '@/components/ui/PageBanner';
import { motion } from 'framer-motion';
import { BookOpen, Monitor, MessageCircle, Lightbulb, CheckCircle2, ArrowRight, Brain } from 'lucide-react';
import Link from 'next/link';

const EducationProgram = () => {
  const features = [
    {
      title: "Digital Literacy",
      desc: "Basic training on using smartphones, internet, and essential government apps for daily life.",
      icon: Monitor,
      color: "#6A1B9A"
    },
    {
      title: "Social Awareness",
      desc: "Workshops on legal rights, financial safety, and social welfare schemes available for women.",
      icon: Lightbulb,
      color: "#E91E63"
    },
    {
      title: "Soft Skills",
      desc: "Communication, leadership, and confidence-building sessions to prepare women for leadership roles.",
      icon: Brain,
      color: "#4CAF50"
    }
  ];

  return (
    <main className="overflow-x-hidden">
      <PageBanner 
        title="Education & Awareness" 
        subtitle="Knowledge is the strongest tool for empowerment. We bridge the gap between information and action."
        image="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1500"
      />

      {/* Philosophy Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-6 leading-tight">
              Breaking the <span className="text-gradient">Silence of Ignorance</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">
              Many women are held back not by lack of talent, but by lack of information. 
              Our education programs are designed to enlighten, inspire, and enable every woman 
              to navigate the modern world with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 p-8 sm:p-10 rounded-[35px] text-center border border-gray-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-black/5"
              >
                <div 
                  className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-black/[0.03]"
                  style={{ color: item.color }}
                >
                  <item.icon size={30} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-4">{item.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Workshops */}
      <section className="section-padding bg-secondary text-white relative overflow-hidden">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">Community <span className="text-primary">Learning Hubs</span></h2>
              <p className="text-base sm:text-lg lg:text-xl opacity-80 leading-relaxed mb-10 font-medium">
                We establish physical centers in blocks where women can gather to learn from each other 
                and from expert trainers. These hubs are the heart of our awareness campaigns.
              </p>
              <div className="grid gap-5 text-left max-w-xl mx-auto lg:mx-0">
                {[
                  "Weekly expert-led video sessions",
                  "Direct interaction with field officers",
                  "Hands-on practice with digital tools",
                  "Safe space for sharing and learning"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-base sm:text-lg font-bold">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0">
                       <CheckCircle2 size={16} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="rounded-[30px] lg:rounded-[40px] overflow-hidden h-[300px] sm:h-[450px] lg:h-[500px] border-[6px] lg:border-[10px] border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb28f74b671?q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Workshop Session"
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Call to Enroll */}
      <section className="section-padding bg-white text-center">
        <div className="container">
          <div className="bg-primary/5 p-8 sm:p-12 lg:p-24 rounded-[40px] lg:rounded-[60px] border-2 border-dashed border-primary/30 relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl text-primary">
                <BookOpen size={40} />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">Start Your Learning <span className="text-gradient">Journey</span></h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-10 lg:mb-12 font-medium leading-relaxed">
                Education is a right, not a privilege. Join our next workshop and take the first step towards a smarter, brighter future.
              </p>
              <Link href="/register" className="btn-primary py-5 px-10 sm:px-16 text-base sm:text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform inline-flex">
                 Join Training Program
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EducationProgram;

