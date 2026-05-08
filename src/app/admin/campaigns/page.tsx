'use client';

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Target, Calendar, Plus, Search, 
  Trash2, Edit2, ShieldCheck, Clock,
  FileText, ImageIcon, ExternalLink
} from "lucide-react";
import axios from "axios";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: '',
    status: 'active'
  });

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/admin/campaigns');
      if (res.data.success) setCampaigns(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/campaigns', formData);
      if (res.data.success) {
        fetchCampaigns();
        setShowCreate(false);
        setFormData({ title: '', description: '', targetAudience: '', status: 'active' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--secondary)' }}>Active Campaigns</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage awareness drives, training programs, and health missions.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ padding: '15px 30px' }}>
          <Plus size={20} /> Launch Campaign
        </button>
      </div>

      {showCreate && (
        <div className="glass-card" style={{ background: 'white', padding: '30px', borderRadius: '30px', marginBottom: '30px', border: '2px dashed var(--primary)' }}>
           <h3 style={{ marginBottom: '20px', fontWeight: '800' }}>New Campaign Setup</h3>
           <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <input required placeholder="Campaign Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
              <input placeholder="Target Audience" value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
              <textarea required placeholder="Campaign Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee', gridColumn: '1/-1' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '12px 30px' }}>Create & Activate</button>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '12px 30px', background: '#f5f5f5', border: 'none', borderRadius: '15px', cursor: 'pointer' }}>Cancel</button>
              </div>
           </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center' }}>Syncing with campaign records...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
          {campaigns.map((c) => (
            <div key={c._id} style={{ background: 'white', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f5f5f5' }}>
              <div style={{ background: 'var(--grad-primary)', padding: '30px', color: 'white' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}><Target size={24} /></div>
                    <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>{c.status.toUpperCase()}</span>
                 </div>
                 <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '20px', marginBottom: '5px' }}>{c.title}</h3>
                 <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Target: {c.targetAudience || 'General Public'}</p>
              </div>
              <div style={{ padding: '30px' }}>
                 <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '25px' }}>{c.description}</p>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                       <p style={{ margin: 0, fontSize: '0.7rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Launch Date</p>
                       <p style={{ margin: '5px 0 0', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color="var(--primary)" /> {new Date(c.startDate).toLocaleDateString()}
                       </p>
                    </div>
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '15px' }}>
                       <p style={{ margin: 0, fontSize: '0.7rem', color: '#999', fontWeight: '800', textTransform: 'uppercase' }}>Resources</p>
                       <p style={{ margin: '5px 0 0', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={14} color="var(--primary)" /> 2 Guides
                       </p>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #eee', background: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                       <Edit2 size={16} /> Edit
                    </button>
                    <button style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--secondary)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                       <ImageIcon size={16} /> Banners
                    </button>
                 </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '30px', border: '1px solid #f5f5f5' }}>
                <Target size={60} color="#eee" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#999' }}>No active campaigns found. Start one to begin tracking community growth.</h3>
             </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
