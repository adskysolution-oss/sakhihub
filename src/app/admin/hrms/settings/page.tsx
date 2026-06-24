'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';
import { Shield, Save, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function HrmsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shiftStartTime: '09:00',
    graceMinutes: 10,
    shiftEndTime: '18:30',
    earlyCheckoutThreshold: '18:00',
    consecutiveLateThreshold: 3
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hrms/settings');
      if (res.data.success) {
        const { shiftStartTime, graceMinutes, shiftEndTime, earlyCheckoutThreshold, consecutiveLateThreshold } = res.data.data;
        setFormData({
          shiftStartTime: shiftStartTime || '09:00',
          graceMinutes: graceMinutes ?? 10,
          shiftEndTime: shiftEndTime || '18:30',
          earlyCheckoutThreshold: earlyCheckoutThreshold || '18:00',
          consecutiveLateThreshold: consecutiveLateThreshold ?? 3
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load shift settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('/api/hrms/settings', formData);
      if (res.data.success) {
        toast.success('Shift rules updated successfully!');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p style={{ marginTop: '15px', color: '#666', fontWeight: 'bold' }}>Loading shift policies...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Breadcrumb / Back button */}
        <div>
          <button 
            onClick={() => window.location.href = '/admin/hrms/dashboard'}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)' }}>Shift Policy Settings</h2>
          <p style={{ color: '#888' }}>Configure compliance metrics, shift grace periods, early check-out thresholds, and consecutive late penalties.</p>
        </div>

        {/* Card Form */}
        <form onSubmit={handleSubmit} style={{ padding: '35px', background: 'white', borderRadius: '32px', border: '1px solid #f0f0f0', boxShadow: '0 10px 40px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
            <Clock size={20} className="text-primary" /> Core Shift Configurations
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="max-sm:grid-cols-1">
            {/* Shift Start */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                Shift Start Time
              </label>
              <input
                type="time"
                value={formData.shiftStartTime}
                onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                required
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>

            {/* Grace Minutes */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.graceMinutes}
                onChange={(e) => setFormData({ ...formData, graceMinutes: Number(e.target.value) })}
                required
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="max-sm:grid-cols-1">
            {/* Shift End */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                Shift End Time
              </label>
              <input
                type="time"
                value={formData.shiftEndTime}
                onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                required
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>

            {/* Early Checkout Threshold */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                Early Checkout Threshold Time
              </label>
              <input
                type="time"
                value={formData.earlyCheckoutThreshold}
                onChange={(e) => setFormData({ ...formData, earlyCheckoutThreshold: e.target.value })}
                required
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            {/* Consecutive Late Threshold */}
            <label style={{ fontSize: '0.85rem', fontWeight: '800', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              Consecutive Late Warning Threshold (Days)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={formData.consecutiveLateThreshold}
              onChange={(e) => setFormData({ ...formData, consecutiveLateThreshold: Number(e.target.value) })}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #ddd', outline: 'none' }}
            />
          </div>

          <div style={{ padding: '15px 20px', background: '#f9f9f9', borderRadius: '20px', border: '1px solid #eee', fontSize: '0.8rem', color: '#666', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <HelpCircle size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: '850', color: 'var(--secondary)' }}>Compliance Rules Explained:</p>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc', marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Late cutoff:</strong> If employee registers check-in after Start Time + Grace (e.g. 09:10 AM), check-in is logged as <strong>Late</strong>.</li>
                <li><strong>Consecutive Penalty:</strong> Consecutive lates up to threshold minus 1 trigger warning escalations. The threshold day (e.g. 3rd Consecutive Late) triggers <strong>Penalty Pending</strong>.</li>
                <li><strong>Major Early Checkout:</strong> Checking out before the threshold time (e.g. 06:00 PM) triggers a major exception pending admin review.</li>
              </ul>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', justifyContent: 'center', gap: '10px', marginTop: '10px' }}
          >
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
