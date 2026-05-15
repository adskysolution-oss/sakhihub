'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Sparkles, Search, Plus, 
  Trash2, Edit3, Eye, EyeOff,
  Calendar, Clock, LayoutGrid,
  List, MoreVertical, ExternalLink,
  ChevronRight, AlertCircle
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProjectModal from "@/components/features/admin/ProjectModal";
import Image from "next/image";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/projects');
      if (res.data.success) setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const handleToggleStatus = async (project: any) => {
    try {
      const newStatus = project.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/api/admin/projects/${project._id}`, { status: newStatus });
      fetchProjects();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleToggleVisibility = async (project: any) => {
    try {
      await axios.put(`/api/admin/projects/${project._id}`, { isVisible: !project.isVisible });
      fetchProjects();
    } catch (err) {
      console.error("Failed to toggle visibility", err);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Sparkles size={20} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">Project Registry</h1>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manage public social initiatives and micro-industry programs.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedProject(null);
              setShowModal(true);
            }}
            className="btn-primary py-4 px-8 shadow-xl shadow-primary/20"
          >
            <Plus size={20} /> Create New Project
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..." 
              className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white rounded-[40px] border border-gray-100">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6 bg-white rounded-[40px] border border-gray-100 text-center p-10">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <Sparkles size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-secondary">No Projects Found</h3>
              <p className="text-gray-400 font-bold mt-2">Start by creating your first social initiative.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary py-3 px-8"
            >
              <Plus size={18} /> Add Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <motion.div 
                layout
                key={project._id}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-soft hover:shadow-xl transition-all"
              >
                {/* Poster Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  {project.posterImage ? (
                    <img 
                      src={project.posterImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                      <Sparkles size={60} />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${project.status === 'active' ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}>
                      {project.status}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${project.isVisible ? 'bg-primary/80 text-white' : 'bg-secondary/80 text-white'}`}>
                      {project.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button 
                      onClick={() => {
                        setSelectedProject(project);
                        setShowModal(true);
                      }}
                      className="p-4 bg-white text-secondary rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(project._id)}
                      className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <a 
                      href={`/projects/${project.slug}`} 
                      target="_blank"
                      className="p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                  <p className="text-gray-400 font-bold text-xs mt-2 line-clamp-2 leading-relaxed italic">"{project.tagline}"</p>
                  
                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(project)}
                        className={`p-2 rounded-lg transition-all ${project.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}
                        title={project.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Clock size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleVisibility(project)}
                        className={`p-2 rounded-lg transition-all ${project.isVisible ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-gray-400'}`}
                        title={project.isVisible ? 'Hide from Public' : 'Show on Public'}
                      >
                        {project.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-soft">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility & Status</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created On</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {project.posterImage ? (
                            <img src={project.posterImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Sparkles size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-secondary group-hover:text-primary transition-all">{project.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest line-clamp-1">{project.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {project.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.isVisible ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                          {project.isVisible ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedProject(project);
                            setShowModal(true);
                          }}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-secondary hover:text-white transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleVisibility(project)}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-primary hover:text-white transition-all"
                        >
                          {project.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(project._id)}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ProjectModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchProjects}
          project={selectedProject}
        />
      </div>
    </DashboardLayout>
  );
}
