'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Plus, Trash2, Upload,
  Image as ImageIcon, Sparkles,
  Type, AlignLeft, Flag, List,
  Eye, EyeOff, ShieldCheck, Heart, Users2, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    mrp: '',
    offerPrice: '',
    highlights: [''],
    benefits: [''],
    features: [''],
    bestFor: [''],
    posterImage: '',
    status: 'active',
    isVisible: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        shortDescription: product.shortDescription || '',
        mrp: product.mrp !== undefined ? String(product.mrp) : '',
        offerPrice: product.offerPrice !== undefined ? String(product.offerPrice) : '',
        highlights: product.highlights || [''],
        benefits: product.benefits || [''],
        features: product.features || [''],
        bestFor: product.bestFor || [''],
        posterImage: product.posterImage || '',
        status: product.status || 'active',
        isVisible: product.isVisible ?? true,
      });
      setPreviewImage(product.posterImage || null);
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        mrp: '',
        offerPrice: '',
        highlights: [''],
        benefits: [''],
        features: [''],
        bestFor: [''],
        posterImage: '',
        status: 'active',
        isVisible: true,
      });
      setPreviewImage(null);
    }
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setFormData({ ...formData, posterImage: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArrayChange = (field: 'highlights' | 'benefits' | 'features' | 'bestFor', index: number, value: string) => {
    const arr = [...formData[field]];
    arr[index] = value;
    setFormData({ ...formData, [field]: arr });
  };

  const addArrayItem = (field: 'highlights' | 'benefits' | 'features' | 'bestFor') => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field: 'highlights' | 'benefits' | 'features' | 'bestFor', index: number) => {
    const arr = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: arr.length > 0 ? arr : [''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        mrp: Number(formData.mrp),
        offerPrice: Number(formData.offerPrice),
      };

      if (product) {
        await axios.put(`/api/admin/products/${product._id}`, payload);
      } else {
        await axios.post('/api/admin/products', payload);
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
              <h3 className="text-2xl font-black tracking-tight">{product ? 'Edit Product' : 'New Product'}</h3>
              <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest mt-1">Product Management Module</p>
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
                    <Type size={12} /> Product Title
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter product name / title"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      MRP (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      placeholder="e.g. 120"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Offer Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                      placeholder="e.g. 100"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
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
                  placeholder="Describe the product details..."
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* Highlights & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Highlights */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <List size={12} /> Product Highlights
                </label>
                <div className="flex flex-col gap-3">
                  {formData.highlights.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('highlights', i, e.target.value)}
                        placeholder={`Highlight ${i + 1}`}
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('highlights', i)}
                        className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem('highlights')}
                  className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:pl-2 transition-all"
                >
                  <Plus size={14} /> Add Highlight
                </button>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Heart size={12} /> Benefits
                </label>
                <div className="flex flex-col gap-3">
                  {formData.benefits.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('benefits', i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('benefits', i)}
                        className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem('benefits')}
                  className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:pl-2 transition-all"
                >
                  <Plus size={14} /> Add Benefit
                </button>
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* Features & Best For */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Features */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck size={12} /> Product Features
                </label>
                <div className="flex flex-col gap-3">
                  {formData.features.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('features', i, e.target.value)}
                        placeholder={`Feature ${i + 1}`}
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', i)}
                        className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem('features')}
                  className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:pl-2 transition-all"
                >
                  <Plus size={14} /> Add Feature
                </button>
              </div>

              {/* Best For */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Users2 size={12} /> Best For
                </label>
                <div className="flex flex-col gap-3">
                  {formData.bestFor.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange('bestFor', i, e.target.value)}
                        placeholder={`Audience / Best For ${i + 1}`}
                        className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('bestFor', i)}
                        className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addArrayItem('bestFor')}
                  className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:pl-2 transition-all"
                >
                  <Plus size={14} /> Add Best For
                </button>
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* Poster Upload & Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ImageIcon size={12} /> Product Poster Image
                </label>
                <div className="relative group aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] overflow-hidden flex items-center justify-center transition-all hover:border-primary/50">
                  {previewImage ? (
                    <>
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <label className="p-4 bg-white rounded-2xl text-secondary font-black text-xs cursor-pointer shadow-xl active:scale-95 transition-all">
                          Change Image
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
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
                        <p className="text-[9px] text-gray-400 font-bold mt-1">Cloudinary image integration</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-end gap-6">
                <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100">
                  <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Info size={14} /> Cloudinary Poster</h5>
                  <p className="text-xs text-blue-500 font-medium leading-relaxed">The poster image will automatically be optimized and hosted securely on Cloudinary. It is displayed on public product cards and detailed pages.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <><Sparkles size={18} /> {product ? 'Update Product' : 'Publish Product'}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
