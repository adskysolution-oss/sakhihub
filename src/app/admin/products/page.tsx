'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Sparkles, Search, Plus, 
  Trash2, Edit3, Eye, EyeOff,
  Calendar, Clock, LayoutGrid,
  List, MoreVertical, ExternalLink,
  ChevronRight, AlertCircle, ShoppingBag, Heart
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ProductModal from "@/components/features/admin/ProductModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/products');
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleToggleStatus = async (product: any) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await axios.put(`/api/admin/products/${product._id}`, { status: newStatus });
      fetchProducts();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleToggleVisibility = async (product: any) => {
    try {
      await axios.put(`/api/admin/products/${product._id}`, { isVisible: !product.isVisible });
      fetchProducts();
    } catch (err) {
      console.error("Failed to toggle visibility", err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.shortDescription.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <ShoppingBag size={20} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-secondary">Product Inventory</h1>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Manage SakhiHub product catalog, pricing, and visibility settings.</p>
          </div>
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setShowModal(true);
            }}
            className="btn-primary py-4 px-8 shadow-xl shadow-primary/20"
          >
            <Plus size={20} /> Create New Product
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
              placeholder="Search products..." 
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
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Syncing Inventory...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-6 bg-white rounded-[40px] border border-gray-100 text-center p-10">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
              <ShoppingBag size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-secondary">No Products Found</h3>
              <p className="text-gray-400 font-bold mt-2">Start by creating your first product item.</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="btn-primary py-3 px-8"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                key={product._id}
                className="group relative bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-soft hover:shadow-xl transition-all flex flex-col"
              >
                {/* Poster Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden shrink-0">
                  {product.posterImage ? (
                    <img 
                      src={product.posterImage} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                      <ShoppingBag size={60} />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${product.status === 'active' ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}>
                      {product.status}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${product.isVisible ? 'bg-primary/80 text-white' : 'bg-secondary/80 text-white'}`}>
                      {product.isVisible ? 'Visible' : 'Hidden'}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowModal(true);
                      }}
                      className="p-4 bg-white text-secondary rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="p-4 bg-red-50 text-red-500 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                    <a 
                      href={`/products/${product.slug}`} 
                      target="_blank"
                      className="p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
                  <p className="text-gray-400 font-bold text-xs mt-2 line-clamp-2 leading-relaxed">
                    {product.shortDescription}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs line-through text-gray-300 font-bold">MRP ₹{product.mrp}</span>
                    <span className="text-base font-black text-primary">Offer ₹{product.offerPrice}</span>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`p-2 rounded-lg transition-all ${product.status === 'active' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Clock size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleVisibility(product)}
                        className={`p-2 rounded-lg transition-all ${product.isVisible ? 'bg-blue-50 text-primary' : 'bg-gray-100 text-gray-400'}`}
                        title={product.isVisible ? 'Hide from Public' : 'Show on Public'}
                      >
                        {product.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
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
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility & Status</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Created On</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {product.posterImage ? (
                            <img src={product.posterImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-secondary group-hover:text-primary transition-all">{product.title}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest line-clamp-1">{product.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-300 line-through font-bold">MRP ₹{product.mrp}</span>
                        <span className="text-sm text-primary font-black">Offer ₹{product.offerPrice}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${product.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {product.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${product.isVisible ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                          {product.isVisible ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-gray-500">{new Date(product.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowModal(true);
                          }}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-secondary hover:text-white transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleToggleVisibility(product)}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-primary hover:text-white transition-all"
                        >
                          {product.isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)}
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

        <ProductModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchProducts}
          product={selectedProduct}
        />
      </div>
    </DashboardLayout>
  );
}
