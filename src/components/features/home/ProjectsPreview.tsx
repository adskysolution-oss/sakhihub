'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronRight, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function ProjectsPreview() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/api/projects');
        if (res.data.success) {
          // Only show top 3 on home page
          setProjects(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
            >
              <Sparkles size={14} /> Social Impact Initiatives
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-secondary leading-tight"
            >
              Our Ongoing <span className="text-primary italic">Projects.</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/projects" className="flex items-center gap-2 text-sm font-black text-secondary uppercase tracking-widest hover:text-primary hover:gap-4 transition-all">
              View All Projects <ArrowRight size={18} className="text-primary" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[40px] animate-pulse"></div>
            ))
          ) : (
            projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-[550px] rounded-[50px] overflow-hidden shadow-2xl border border-gray-100"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  {(project.secondaryImage || project.posterImage) ? (
                    <img 
                      src={project.secondaryImage || project.posterImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-white/10">
                      <LayoutGrid size={100} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-3">
                      {project.title}
                    </h3>
                    <p className="text-white/70 font-bold text-sm line-clamp-2 mb-6 italic">
                      "{project.tagline}"
                    </p>
                    <Link 
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-xl shadow-primary/20"
                    >
                      Explore Project <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
