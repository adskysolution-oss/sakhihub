'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, Target,
  Users, Briefcase, Heart,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function PublicProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/projects');
        if (res.data.success) setProjects(res.data.data);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true }
  };

  return (
    <main className="min-h-screen bg-[#FFF5F8]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-secondary">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 text-white font-bold text-xs uppercase tracking-widest mb-8 shadow-2xl"
            >
              <Sparkles size={14} className="text-primary" /> Social Initiatives
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8"
            >
              Empowering Communities <br /> Through <span className="text-primary italic">Innovation.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-white/70 font-medium leading-relaxed max-w-2xl mb-12"
            >
              Our projects focus on creating sustainable income opportunities and fostering self-reliance among rural women.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[40px] aspect-[4/5] animate-pulse border border-gray-100"></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-soft">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6">
                <Target size={40} />
              </div>
              <h3 className="text-2xl font-black text-secondary uppercase tracking-tight">New Initiatives Coming Soon</h3>
              <p className="text-gray-400 font-bold mt-2 max-w-md mx-auto">We are currently designing impactful programs to empower more women across India.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="relative aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl mb-8 bg-white border border-gray-100">
                      {(project.secondaryImage || project.posterImage) ? (
                        <img
                          src={project.secondaryImage || project.posterImage}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-100 bg-gray-50">
                          <Sparkles size={80} />
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                      {/* Content Overlay */}
                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="inline-flex px-4 py-1.5 bg-primary/90 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-lg backdrop-blur-md">
                            Active Program
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">{project.title}</h3>
                          <p className="text-white/80 font-bold text-sm line-clamp-2 italic mb-6">"{project.tagline}"</p>

                          <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            Explore Details <ArrowUpRight size={16} className="text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="px-4">
                    <p className="text-gray-400 font-bold text-sm leading-relaxed line-clamp-3">
                      {project.shortDescription}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-primary to-secondary p-12 md:p-20 rounded-[60px] shadow-2xl relative overflow-hidden text-center"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Want to support our <span className="text-primary-dark italic">cause?</span></h2>
              <p className="text-xl text-white/70 font-bold max-w-2xl mx-auto mb-12">
                Join our network as a vendor, employee, or member and help us reach more villages across the nation.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/register" className="px-10 py-5 bg-white text-secondary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  Join SakhiHub
                </Link>
                <Link href="/contact" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
