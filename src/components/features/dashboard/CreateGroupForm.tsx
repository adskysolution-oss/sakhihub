'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, Calendar, ClipboardList, 
  Camera, Map as MapIcon, Save, ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function CreateGroupForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    groupName: '',
    village: '',
    panchayatWard: '',
    block: '',
    district: '',
    leaderName: '',
    leaderMobile: '',
    meetingDate: '',
    campaignId: '',
    remarks: '',
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get('/api/admin/campaigns');
        if (res.data.success) setCampaigns(res.data.data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      }
    };
    fetchCampaigns();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/groups', formData);
      if (res.data.success) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to create group", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontWeight: '700' }}>
        <ArrowLeft size={18} /> Back to Groups
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Create New Group</h2>
          <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Add a new community unit to your area</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Group Name</label>
              <input required name="groupName" value={formData.groupName} onChange={handleChange} placeholder="e.g., Mahila Shakti Group" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Campaign</label>
              <select required name="campaignId" value={formData.campaignId} onChange={handleChange} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: 'white' }}>
                <option value="">Select Active Campaign</option>
                {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                <option value="temp">Health Awareness 2024</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Village / Area</label>
              <input required name="village" value={formData.village} onChange={handleChange} placeholder="Enter Village Name" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Meeting Date</label>
              <input required type="date" name="meetingDate" value={formData.meetingDate} onChange={handleChange} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Panchayat / Ward</label>
              <input required name="panchayatWard" value={formData.panchayatWard} onChange={handleChange} placeholder="Panchayat" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Block</label>
              <input required name="block" value={formData.block} onChange={handleChange} placeholder="Block" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>District</label>
              <input required name="district" value={formData.district} onChange={handleChange} placeholder="District" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Group Leader Name</label>
              <input required name="leaderName" value={formData.leaderName} onChange={handleChange} placeholder="Leader Name" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Leader Mobile</label>
              <input required type="tel" name="leaderMobile" value={formData.leaderMobile} onChange={handleChange} placeholder="Leader Mobile No" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Remarks (Optional)</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any special notes about the group..." rows={3} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
          </div>

          <button disabled={loading} type="submit" className="btn-primary" style={{ padding: '20px', justifyContent: 'center', fontSize: '1.1rem' }}>
            {loading ? "Creating Group..." : "Save Group Details"} <Sparkles size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
