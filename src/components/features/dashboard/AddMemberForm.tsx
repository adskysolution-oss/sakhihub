'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Phone, MapPin, Briefcase, 
  Heart, Sparkles, ArrowLeft, Users, 
  ChevronDown, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const occupations = ["Housewife", "Self Employed", "Labor", "Student", "Farmer", "Other"];
const interestOptions = ["Health Awareness", "Sakhi Care Pads", "Employment", "Training", "Volunteer"];

export default function AddMemberForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    age: '',
    maritalStatus: 'Married',
    occupation: '',
    interests: [] as string[],
    groupId: '',
    village: '',
    district: '',
    block: '',
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('/api/groups');
        if (res.data.success) setGroups(res.data.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/members', formData);
      if (res.data.success) onSuccess();
    } catch (err) {
      console.error("Failed to add member", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontWeight: '700' }}>
        <ArrowLeft size={18} /> Back to Members
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Add Women Member</h2>
          <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Register a new community member under a group</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '25px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Member Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Mobile Number</label>
              <input required type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="10 Digit Number" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Age</label>
              <input required type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Marital Status</label>
              <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: 'white' }}>
                <option value="Married">Married</option>
                <option value="Unmarried">Unmarried</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Occupation</label>
              <select required name="occupation" value={formData.occupation} onChange={handleChange} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: 'white' }}>
                <option value="">Select Occupation</option>
                {occupations.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Select Group</label>
            <select required name="groupId" value={formData.groupId} onChange={handleChange} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee', background: 'white' }}>
              <option value="">Choose a Group</option>
              {groups.map(g => <option key={g._id} value={g._id}>{g.groupName} ({g.village})</option>)}
              <option value="temp">Example Group - Village A</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <input required name="village" value={formData.village} onChange={handleChange} placeholder="Village" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            <input required name="block" value={formData.block} onChange={handleChange} placeholder="Block" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            <input required name="district" value={formData.district} onChange={handleChange} placeholder="District" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Interested In (Multiple Selection)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {interestOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleInterest(option)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '100px',
                    border: '1px solid',
                    borderColor: formData.interests.includes(option) ? 'var(--primary)' : '#eee',
                    background: formData.interests.includes(option) ? '#FFF5F8' : 'white',
                    color: formData.interests.includes(option) ? 'var(--primary)' : '#666',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: '0.2s'
                  }}
                >
                  {formData.interests.includes(option) && <CheckCircle size={14} />}
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn-primary" style={{ padding: '20px', justifyContent: 'center', fontSize: '1.1rem', marginTop: '10px' }}>
            {loading ? "Adding Member..." : "Complete Registration"} <Sparkles size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
