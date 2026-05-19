'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, LayoutGrid } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function ProjectsPreview() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

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
              <Sparkles size={14} /> {t('projects.tag')}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-secondary leading-tight"
            >
              {t('projects.title').split(' ').map((word: string, i: number, arr: string[]) => (
                <span key={i}>
                  {word.includes('Projects') ? <span className="text-primary italic">{word}</span> : word}{' '}
                </span>
              ))}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/projects" className="flex items-center gap-2 text-sm font-black text-secondary uppercase tracking-widest hover:text-primary hover:gap-4 transition-all">
              {t('projects.viewAll')} <ArrowRight size={18} className="text-primary" />
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
                      <div className="w-full h-full bg-secondary flex items-center justify-center text-white/10">
                        <LayoutGrid size={80} />
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="inline-flex px-4 py-1.5 bg-primary/90 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-lg backdrop-blur-md">
                          {t('projects.activeBadge')}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">{project.title}</h3>
                        <p className="text-white/80 font-bold text-sm line-clamp-2 italic mb-6">"{project.tagline}"</p>

                        <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          {t('projects.exploreDetails')} <ArrowRight size={16} className="text-primary" />
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
