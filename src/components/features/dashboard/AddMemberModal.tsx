'use client';

import React, { useState } from 'react';
import { X, User, Phone, MapPin, Briefcase, Heart, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface AddMemberModalProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ groupId, groupName, onClose, onSuccess }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    village: '',
    district: '',
    block: '',
    maritalStatus: 'Married',
    occupation: '',
    interests: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/members', {
        ...formData,
        groupId,
        age: parseInt(formData.age),
      });
      if (res.data.success) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to add member. Please check all fields.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'relative', background: 'white', width: '100%', maxWidth: '600px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'var(--grad-primary)', padding: '25px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>Add New Member</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Registering to group: {groupName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '35px', height: '35px', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '30px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Mobile Number</label>
              <input required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Age</label>
              <input required type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Village</label>
              <input required value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Occupation</label>
              <input required value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '8px' }}>Marital Status</label>
              <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #eee' }}>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '800', color: '#666', marginBottom: '10px' }}>Interests</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Health Awareness', 'Sakhi Care Pads', 'Employment', 'Education', 'Self-Help'].map(interest => (
                  <button 
                    key={interest} 
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    style={{ 
                      padding: '8px 15px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '700',
                      background: formData.interests.includes(interest) ? 'var(--primary)' : '#f5f5f5',
                      color: formData.interests.includes(interest) ? 'white' : '#666',
                      border: 'none', cursor: 'pointer'
                    }}
                  >{interest}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--grad-primary)', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
              {loading ? 'Registering...' : 'Register Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
