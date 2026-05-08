'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Globe, Languages, Save, Search, 
  Layout, Type, FileText, CheckCircle, 
  AlertCircle, Edit3
} from "lucide-react";
import axios from "axios";

export default function AdminCMSPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ en: '', hi: '', category: '' });

  const fetchCMS = async () => {
    try {
      const res = await axios.get('/api/admin/cms');
      if (res.data.success) setContents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handleEdit = (item: any) => {
    setEditingKey(item.key);
    setEditForm({ en: item.en, hi: item.hi, category: item.category });
  };

  const handleSave = async (key: string) => {
    try {
      const res = await axios.post('/api/admin/cms', { key, ...editForm });
      if (res.data.success) {
        setEditingKey(null);
        fetchCMS();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = contents.filter(c => 
    c.key.toLowerCase().includes(search.toLowerCase()) ||
    c.en.toLowerCase().includes(search.toLowerCase()) ||
    c.hi.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Content Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Dynamically update website text, translations, and multi-language strings.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#ecfdf5', padding: '10px 20px', borderRadius: '15px', color: '#059669', fontWeight: '800' }}>
           <Globe size={20} /> Live on Production
        </div>
      </div>

      <div className="glass-card" style={{ padding: '25px', background: 'white', borderRadius: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
         <div style={{ position: 'relative', maxWidth: '500px' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '16px', color: '#999' }} />
            <input 
              type="text" 
              placeholder="Search by key or content text..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '15px 15px 15px 45px', borderRadius: '15px', border: '1px solid #eee', width: '100%', outline: 'none' }} 
            />
         </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Fetching dynamic content from database...</div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filtered.map((item) => (
            <div key={item._id} style={{ background: 'white', borderRadius: '25px', padding: '30px', border: editingKey === item.key ? '2px solid var(--primary)' : '1px solid #eee', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '5px 12px', background: '#f5f3ff', color: '#6a1b9a', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{item.category}</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '900', color: 'var(--secondary)' }}>{item.key}</h3>
                 </div>
                 {editingKey === item.key ? (
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingKey(null)} style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid #eee', background: 'white', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => handleSave(item.key)} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                         <Save size={16} /> Update Live
                      </button>
                   </div>
                 ) : (
                   <button onClick={() => handleEdit(item)} style={{ padding: '8px 20px', borderRadius: '10px', border: '1px solid #eee', background: 'white', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Edit3 size={16} /> Edit Content
                   </button>
                 )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                 <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#999', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}><Languages size={14} /> ENGLISH VERSION</label>
                    {editingKey === item.key ? (
                      <textarea value={editForm.en} onChange={e => setEditForm({...editForm, en: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #eee', minHeight: '100px' }} />
                    ) : (
                      <p style={{ margin: 0, fontSize: '1rem', color: '#444', lineHeight: '1.6' }}>{item.en}</p>
                    )}
                 </div>
                 <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#999', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}><Languages size={14} /> HINDI VERSION (हिन्दी)</label>
                    {editingKey === item.key ? (
                      <textarea value={editForm.hi} onChange={e => setEditForm({...editForm, hi: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #eee', minHeight: '100px' }} />
                    ) : (
                      <p style={{ margin: 0, fontSize: '1rem', color: '#444', lineHeight: '1.6', fontWeight: '500' }}>{item.hi}</p>
                    )}
                 </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
             <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '30px' }}>
                <Languages size={60} color="#eee" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#999' }}>No CMS entries found. Add your first dynamic string to start managing content.</h3>
             </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
