'use client';

import React, { useState } from "react";
import { ClipboardCheck, Calendar, Send, CheckCircle } from "lucide-react";

export default function DailyReportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
          <CheckCircle size={50} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Report Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '400px' }}>
          Your daily work report has been successfully sent to the admin. Keep up the great work!
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-primary">Submit Another Report</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Daily Work Reporting</h2>
        <p style={{ color: 'var(--text-muted)' }}>Submit your daily progress and field activities.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Report Date *</label>
            <div style={{ position: 'relative' }}>
              <input required type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Work Type *</label>
            <select required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
              <option>Field Survey</option>
              <option>Group Meeting</option>
              <option>Awareness Camp</option>
              <option>Member Registration</option>
              <option>Follow-up Visit</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Groups Visited Today *</label>
            <input required type="number" placeholder="Enter count" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>New Members Added *</label>
            <input required type="number" placeholder="Enter count" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Work Summary *</label>
          <textarea required placeholder="Describe your field work today in detail..." rows={5} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Challenges Faced (If any)</label>
          <textarea placeholder="Mention any issues you encountered..." rows={3} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
        </div>

        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
          <Send size={20} /> Submit Daily Report
        </button>
      </form>
    </div>
  );
}

