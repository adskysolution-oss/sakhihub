import React from "react";
import { FileText, MapPin, Users, IndianRupee, Camera, Send } from "lucide-react";

export default function DailyReportPage() {
  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Daily Activity Report</h2>
        <p style={{ color: 'var(--text-muted)' }}>Submit your field work report for today.</p>
      </div>

      <form className="glass-card" style={{ padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Date *</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Villages Visited *</label>
            <input type="text" placeholder="e.g. Rampur, Kashi" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Groups Created</label>
            <div style={{ position: 'relative' }}>
              <Users size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input type="number" placeholder="0" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Members Added</label>
            <div style={{ position: 'relative' }}>
              <Users size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input type="number" placeholder="0" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Collection (₹)</label>
            <div style={{ position: 'relative' }}>
              <IndianRupee size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input type="number" placeholder="0" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Pads Sold (Packs)</label>
            <input type="number" placeholder="0" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Issues Faced</label>
            <input type="text" placeholder="e.g. Resistance from elders" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Meeting Photos</label>
          <div style={{ border: '2px dashed #ddd', borderRadius: '15px', padding: '30px', textAlign: 'center', cursor: 'pointer' }}>
            <Camera size={32} color="var(--primary)" style={{ marginBottom: '10px' }} />
            <h5 style={{ fontSize: '0.9rem' }}>Upload Photos</h5>
            <p style={{ fontSize: '0.7rem', color: '#999' }}>Upload up to 5 photos of today's meetings</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Additional Remarks</label>
          <textarea placeholder="Write your remarks here..." rows={4} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
        </div>

        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
          <Send size={20} />
          Submit Daily Report
        </button>
      </form>
    </div>
  );
}
