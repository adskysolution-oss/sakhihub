'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, RefreshCcw, Layout, Type, Image as ImageIcon, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECTIONS = [
  { id: 'home_hero', label: 'Home: Hero Section', icon: Layout },
  { id: 'home_about', label: 'Home: About Section', icon: Type },
  { id: 'about_mission', label: 'About: Mission & Vision', icon: ImageIcon },
  { id: 'programs_list', label: 'Programs: Main List', icon: Layout },
  { id: 'contact_info', label: 'Global: Contact Details', icon: Type },
];

export default function CMSEditor() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchSectionContent();
  }, [activeSection]);

  async function fetchSectionContent() {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section_key', activeSection);

    if (error) {
      console.error(error);
    } else {
      setContent(data || []);
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const updates = content.map(item => ({
        id: item.id,
        content_value: item.content_value,
        section_key: item.section_key,
        content_key: item.content_key,
        language: item.language
      }));

      const { error } = await supabase
        .from('site_content')
        .upsert(updates);

      if (error) throw error;
      setStatus({ type: 'success', msg: 'Content updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  }

  const updateValue = (key: string, value: any) => {
    setContent(prev => prev.map(item => 
      item.content_key === key ? { ...item, content_value: value } : item
    ));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', minHeight: 'calc(100vh - 100px)', gap: '30px', padding: '20px' }}>
      {/* Sidebar */}
      <div className="glass-card" style={{ padding: '20px', background: 'white', borderRadius: '24px' }}>
        <h3 style={{ marginBottom: '25px', color: 'var(--secondary)', padding: '0 10px' }}>Site Sections</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '15px',
                borderRadius: '15px',
                border: 'none',
                background: activeSection === s.id ? 'var(--grad-primary)' : 'transparent',
                color: activeSection === s.id ? 'white' : '#666',
                fontWeight: '700',
                textAlign: 'left',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              <s.icon size={20} />
              <span style={{ flex: 1 }}>{s.label}</span>
              <ChevronRight size={16} opacity={activeSection === s.id ? 1 : 0} />
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="glass-card" style={{ padding: '40px', background: 'white', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>
              {SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Modify titles, descriptions, and media for this section.</p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={fetchSectionContent} className="btn-secondary" style={{ padding: '10px 20px' }}>
              <RefreshCcw size={18} />
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving || content.length === 0} 
              className="btn-primary" 
              style={{ padding: '10px 30px' }}
            >
              {saving ? 'Saving...' : 'Save Changes'} <Save size={18} style={{ marginLeft: '10px' }} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ 
                padding: '15px 25px', 
                borderRadius: '12px', 
                background: status.type === 'success' ? '#e1ffeb' : '#fff5f8', 
                color: status.type === 'success' ? '#25d366' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '30px',
                fontWeight: '700'
              }}
            >
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {status.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}>Loading content...</div>
          ) : content.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '20px' }}>
              <Layout size={48} style={{ color: '#cbd5e1', marginBottom: '20px' }} />
              <p style={{ color: '#94a3b8' }}>No editable content found for this section yet.</p>
              <button className="btn-primary" style={{ marginTop: '20px' }}>Initialize Section</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {content.map((item) => (
                <div key={item.id} style={{ display: 'grid', gap: '10px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {item.content_key.replace(/_/g, ' ')}
                  </label>
                  
                  {typeof item.content_value === 'string' ? (
                    item.content_value.length > 50 ? (
                      <textarea
                        value={item.content_value}
                        onChange={(e) => updateValue(item.content_key, e.target.value)}
                        rows={4}
                        style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', width: '100%', outline: 'none' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={item.content_value}
                        onChange={(e) => updateValue(item.content_key, e.target.value)}
                        style={{ padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', width: '100%', outline: 'none' }}
                      />
                    )
                  ) : (
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Complex Object (JSON Editing Enabled)</p>
                      <textarea
                        value={JSON.stringify(item.content_value, null, 2)}
                        onChange={(e) => {
                          try {
                            const val = JSON.parse(e.target.value);
                            updateValue(item.content_key, val);
                          } catch (err) {}
                        }}
                        rows={6}
                        style={{ marginTop: '10px', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '0.9rem', width: '100%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
