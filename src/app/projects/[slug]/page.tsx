'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { motion } from 'framer-motion';
import {
  Sparkles, CheckCircle2, ArrowRight,
  Target, Users, Heart, ShieldCheck,
  MousePointer2, Calendar, MapPin
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`/api/projects?slug=${params.slug}`);
        if (res.data.success) setProject(res.data.data);
      } catch (err) {
        console.error("Failed to fetch project", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) fetchProject();
  }, [params.slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-secondary mb-4">Project Not Found</h1>
        <p className="text-gray-400 font-bold mb-8">The project you are looking for does not exist or has been removed.</p>
        <Link href="/projects" className="btn-primary px-8 py-4">Back to Projects</Link>
      </main>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {project.posterImage ? (
            <>
              <img src={project.posterImage} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-secondary/40"></div>
            </>
          ) : (
            <div className="w-full h-full bg-secondary"></div>
          )}
        </div>

        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/20 backdrop-blur-xl rounded-full border border-primary/30 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-10 shadow-2xl"
              >
                <Sparkles size={16} /> Initiative Detail
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-white leading-tight mb-8"
              >
                {project.heroBanner?.heading || project.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-white/80 font-bold leading-relaxed mb-12 max-w-xl italic"
              >
                {project.heroBanner?.subHeading || project.tagline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4 mb-14"
              >
                {(project.heroBanner?.highlights || []).map((h: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-white font-bold text-xs">
                    <CheckCircle2 size={16} className="text-primary shrink-0" /> {h}
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-6"
              >
                <Link href="/register" className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  {project.heroBanner?.ctaText1 || 'Join Program'} <ArrowRight size={20} />
                </Link>
                <Link href="/register?role=member" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  {project.heroBanner?.ctaText2 || 'Become Member'}
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:block relative"
            >
              <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-8 border-white/5 group">
                {(project.secondaryImage || project.posterImage) ? (
                  <img src={project.secondaryImage || project.posterImage} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-white">
                    <Sparkles size={100} />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-32 bg-gray-50/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <motion.div {...fadeInUp}>
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6">Program Overview</h2>
                <h3 className="text-4xl font-black text-secondary leading-tight mb-8">
                  Redefining Women Empowerment Through <span className="text-primary italic">Micro-Industry.</span>
                </h3>
                <p className="text-xl text-gray-500 font-bold leading-relaxed mb-10">
                  {project.shortDescription}
                </p>

                <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-white rounded-3xl shadow-soft border border-gray-50">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Target size={24} />
                    </div>
                    <h4 className="text-sm font-black text-secondary uppercase tracking-widest mb-2">Sustainable</h4>
                    <p className="text-xs text-gray-400 font-bold leading-relaxed">Built for long-term rural development.</p>
                  </div>
                  <div className="p-6 bg-white rounded-3xl shadow-soft border border-gray-50">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                      <Users size={24} />
                    </div>
                    <h4 className="text-sm font-black text-secondary uppercase tracking-widest mb-2">Community</h4>
                    <p className="text-xs text-gray-400 font-bold leading-relaxed">Empowering collective growth.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                <h4 className="text-2xl font-black text-secondary mb-10 flex items-center gap-4">
                  <ShieldCheck size={28} className="text-primary" /> Key Highlights
                </h4>
                <div className="space-y-6">
                  {(project.highlights || []).map((highlight: string, i: number) => (
                    <div key={i} className="flex gap-5 items-start group">
                      <div className="w-8 h-8 rounded-full bg-gray-50 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-lg text-gray-600 font-bold pt-1">{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-secondary rounded-[32px] text-white">
                  <h5 className="text-sm font-black uppercase tracking-widest mb-2">Want to know more?</h5>
                  <p className="text-xs text-white/60 font-bold leading-relaxed mb-6">Our field executives are ready to help you join this program in your village.</p>
                  <Link href="/register" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                    Contact an Expert <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-black text-secondary mb-8">Start your journey <br /> with <span className="text-primary italic">SakhiHub.</span></h2>
            <p className="text-xl text-gray-400 font-bold mb-12 max-w-2xl mx-auto italic">"{project.tagline}"</p>
            <Link href="/register" className="btn-primary py-6 px-12 text-lg shadow-2xl shadow-primary/30">
              Get Started Today
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
