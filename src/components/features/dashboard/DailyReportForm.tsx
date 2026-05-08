'use client';

import React, { useState } from 'react';
import { 
  ClipboardCheck, MapPin, Users, UserPlus, 
  IndianRupee, Package, Camera, Send,
  ArrowLeft, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function DailyReportForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    date: new RegExp(/^\d{4}-\d{2}-\d{2}$/).test(new Date().toISOString().split('T')[0]) ? new Date().toISOString().split('T')[0] : '',
    villagesVisited: '',
    groupsCreated: 0,
    membersAdded: 0,
    membershipCollected: 0,
    padsInquiry: 0,
    padsSold: 0,
    remarks: '',
    issuesFaced: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'number' ? parseInt(value) || 0 : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/reports/daily', {
        ...formData,
        villagesVisited: formData.villagesVisited.split(',').map(v => v.trim())
      });
      if (res.data.success) setSubmitted(true);
    } catch (err) {
      console.error("Report submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', background: 'white', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>Report Submitted!</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Your daily activity has been logged successfully. Great work today!</p>
        <button onClick={onSuccess} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '18px' }}>Back to Dashboard</button>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontWeight: '700' }}>
        <ArrowLeft size={18} /> Cancel
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Daily Activity Report</h2>
          <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Submit your field work summary for today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '25px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Work Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Villages Visited</label>
              <input required name="villagesVisited" value={formData.villagesVisited} onChange={handleChange} placeholder="e.g. Village A, Village B" style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            {[
              { label: "Groups", name: "groupsCreated", icon: Users },
              { label: "Members", name: "membersAdded", icon: UserPlus },
              { label: "Collection", name: "membershipCollected", icon: IndianRupee },
              { label: "Pad Inquiry", name: "padsInquiry", icon: Package },
            ].map(field => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', textAlign: 'center' }}>{field.label}</label>
                <input required type="number" name={field.name} value={(formData as any)[field.name]} onChange={handleChange} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #eee', textAlign: 'center', fontSize: '1.1rem', fontWeight: '800' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Issues Faced / Help Needed</label>
            <textarea name="issuesFaced" value={formData.issuesFaced} onChange={handleChange} placeholder="Any challenges or support required..." rows={2} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '800' }}>Additional Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="General notes about today's work..." rows={2} style={{ padding: '15px', borderRadius: '15px', border: '1px solid #eee' }} />
          </div>

          <div style={{ padding: '20px', border: '2px dashed #eee', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#999', cursor: 'pointer' }}>
             <Camera size={24} /> <span>Upload Meeting Photos</span>
          </div>

          <button disabled={loading} type="submit" className="btn-primary" style={{ padding: '20px', justifyContent: 'center', fontSize: '1.1rem', marginTop: '10px' }}>
            {loading ? "Submitting Report..." : "Submit Daily Report"} <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
