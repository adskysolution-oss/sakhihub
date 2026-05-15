'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Upload,
  Image as ImageIcon, Sparkles,
  Type, AlignLeft, Flag, List,
  Monitor, Layout, MousePointer2,
  Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: any;
}

export default function ProjectModal({ isOpen, onClose, onSuccess, project }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewSecondaryImage, setPreviewSecondaryImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    tagline: '',
    highlights: [''],
    heroBanner: {
      heading: '',
      subHeading: '',
      highlights: [''],
      ctaText1: 'Join Program',
      ctaText2: 'Become Member',
    },
    posterImage: '',
    secondaryImage: '',
    status: 'active',
    isVisible: true,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        shortDescription: project.shortDescription || '',
        tagline: project.tagline || '',
        highlights: project.highlights || [''],
        heroBanner: {
          heading: project.heroBanner?.heading || '',
          subHeading: project.heroBanner?.subHeading || '',
          highlights: project.heroBanner?.highlights || [''],
          ctaText1: project.heroBanner?.ctaText1 || 'Join Program',
          ctaText2: project.heroBanner?.ctaText2 || 'Become Member',
        },
        posterImage: project.posterImage || '',
        secondaryImage: project.secondaryImage || '',
        status: project.status || 'active',
        isVisible: project.isVisible ?? true,
      });
      setPreviewImage(project.posterImage || null);
      setPreviewSecondaryImage(project.secondaryImage || null);
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        tagline: '',
        highlights: [''],
        heroBanner: {
          heading: '',
          subHeading: '',
          highlights: [''],
          ctaText1: 'Join Program',
          ctaText2: 'Become Member',
        },
        posterImage: '',
        secondaryImage: '',
        status: 'active',
        isVisible: true,
      });
      setPreviewImage(null);
      setPreviewSecondaryImage(null);
    }
  }, [project, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'secondary') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'poster') {
          setPreviewImage(base64);
          setFormData({ ...formData, posterImage: base64 });
        } else {
          setPreviewSecondaryImage(base64);
          setFormData({ ...formData, secondaryImage: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
  };

  const addHighlight = () => {
    setFormData({ ...formData, highlights: [...formData.highlights, ''] });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    setFormData({ ...formData, highlights: newHighlights });
  };

  const handleHeroHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.heroBanner.highlights];
    newHighlights[index] = value;
    setFormData({
      ...formData,
      heroBanner: { ...formData.heroBanner, highlights: newHighlights }
    });
  };

  const addHeroHighlight = () => {
    setFormData({
      ...formData,
      heroBanner: {
        ...formData.heroBanner,
        highlights: [...formData.heroBanner.highlights, '']
      }
    });
  };

  const removeHeroHighlight = (index: number) => {
    const newHighlights = formData.heroBanner.highlights.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      heroBanner: { ...formData.heroBanner, highlights: newHighlights }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (project) {
        await axios.put(`/api/admin/projects/${project._id}`, formData);
      } else {
        await axios.post('/api/admin/projects', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative bg-white w-full max-w-4xl md:rounded-[40px] rounded-t-[32px] shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary to-secondary p-6 md:p-8 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
          ><X size={18} /></button>

          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{project ? 'Edit Project' : 'New Project'}</h3>
              <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mt-1">Project Management Module</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Type size={12} /> Project Title
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter project title"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Flag size={12} /> One Line Tagline
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Short catching tagline"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <AlignLeft size={12} /> Short Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Describe the project purpose..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* Highlights */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <List size={12} /> Project Highlights
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => handleHighlightChange(i, e.target.value)}
                      placeholder={`Highlight ${i + 1}`}
                      className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeHighlight(i)}
                      className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addHighlight}
                className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:pl-2 transition-all"
              >
                <Plus size={14} /> Add Highlight
              </button>
            </div>

            <hr className="border-gray-50" />

            {/* Hero Banner Section */}
            <div className="space-y-8 bg-gray-50/50 p-8 rounded-[32px] border border-gray-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Layout size={20} />
                </div>
                <h4 className="text-lg font-black text-secondary">Hero Banner Configuration</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Heading</label>
                  <input
                    type="text"
                    value={formData.heroBanner.heading}
                    onChange={(e) => setFormData({
                      ...formData,
                      heroBanner: { ...formData.heroBanner, heading: e.target.value }
                    })}
                    placeholder="Large catchy heading"
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl font-bold focus:outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sub Heading</label>
                  <input
                    type="text"
                    value={formData.heroBanner.subHeading}
                    onChange={(e) => setFormData({
                      ...formData,
                      heroBanner: { ...formData.heroBanner, subHeading: e.target.value }
                    })}
                    placeholder="Detail sub-heading"
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl font-bold focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Banner Small Highlights</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.heroBanner.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => handleHeroHighlightChange(i, e.target.value)}
                        placeholder={`Banner Highlight ${i + 1}`}
                        className="flex-1 px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold focus:outline-none shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeHeroHighlight(i)}
                        className="p-3 text-red-400 hover:text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addHeroHighlight}
                  className="flex items-center gap-2 text-[10px] font-black text-secondary uppercase tracking-widest hover:pl-1 transition-all"
                >
                  <Plus size={14} /> Add Banner Highlight
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MousePointer2 size={12} /> CTA Button 1
                  </label>
                  <input
                    type="text"
                    value={formData.heroBanner.ctaText1}
                    onChange={(e) => setFormData({
                      ...formData,
                      heroBanner: { ...formData.heroBanner, ctaText1: e.target.value }
                    })}
                    placeholder="Join Program"
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl font-bold focus:outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MousePointer2 size={12} /> CTA Button 2
                  </label>
                  <input
                    type="text"
                    value={formData.heroBanner.ctaText2}
                    onChange={(e) => setFormData({
                      ...formData,
                      heroBanner: { ...formData.heroBanner, ctaText2: e.target.value }
                    })}
                    placeholder="Become Member"
                    className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl font-bold focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* Image Uploads */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Poster Upload (Image 1) */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <ImageIcon size={12} /> 1. Project Poster (Grid Card)
                  </label>
                  <div className="relative group aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] overflow-hidden flex items-center justify-center transition-all hover:border-primary/50">
                    {previewImage ? (
                      <>
                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <label className="p-4 bg-white rounded-2xl text-secondary font-black text-xs cursor-pointer shadow-xl active:scale-95 transition-all">
                            Change Image
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'poster')} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-3 cursor-pointer p-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-secondary uppercase tracking-widest">Upload Poster</p>
                          <p className="text-[9px] text-gray-400 font-bold mt-1">Shown in the main grid</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'poster')} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Secondary Image Upload (Image 2) */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <ImageIcon size={12} /> 2. Detail Page Hero Image
                  </label>
                  <div className="relative group aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] overflow-hidden flex items-center justify-center transition-all hover:border-primary/50">
                    {previewSecondaryImage ? (
                      <>
                        <img src={previewSecondaryImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <label className="p-4 bg-white rounded-2xl text-secondary font-black text-xs cursor-pointer shadow-xl active:scale-95 transition-all">
                            Change Image
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'secondary')} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center gap-3 cursor-pointer p-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-secondary uppercase tracking-widest">Upload Detail Image</p>
                          <p className="text-[9px] text-gray-400 font-bold mt-1">Shown in the project hero section</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'secondary')} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
                <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100">
                  <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Display Optimization</h5>
                  <p className="text-xs text-blue-500 font-medium leading-relaxed">Image 1 is used for the listing card. Image 2 is used as the high-impact hero background in the project detail page.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none appearance-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Public Visibility</label>
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
                      {formData.isVisible ? <Eye className="text-primary" size={18} /> : <EyeOff className="text-gray-400" size={18} />}
                      <span className="flex-1 text-xs font-black text-secondary uppercase tracking-widest">
                        {formData.isVisible ? 'Public' : 'Hidden'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                        className={`w-12 h-6 rounded-full relative transition-all ${formData.isVisible ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isVisible ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-10 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 rounded-2xl border-2 border-gray-200 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all order-2 md:order-1"
              >Cancel</button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-5 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 order-1 md:order-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Sparkles size={18} /> {project ? 'Update Project' : 'Publish Project'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
