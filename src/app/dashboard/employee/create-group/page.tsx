import React from "react";
import { Users, MapPin, Calendar, Camera, Info } from "lucide-react";

export default function CreateGroupPage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Create New Women Group</h2>
        <p style={{ color: 'var(--text-muted)' }}>Register a new group for awareness and empowerment.</p>
      </div>

      <form className="glass-card" style={{ padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Group Name *</label>
            <input type="text" placeholder="e.g. Mahila Shakti Group" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Village Name *</label>
            <input type="text" placeholder="Enter Village" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Panchayat / Ward</label>
            <input type="text" placeholder="Enter Panchayat" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Meeting Date *</label>
            <input type="date" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Group Leader Name *</label>
            <input type="text" placeholder="Leader Name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Leader Mobile Number *</label>
            <input type="tel" placeholder="Leader Mobile" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Campaign Name</label>
          <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
            <option>Menstrual Hygiene Awareness</option>
            <option>Women Empowerment</option>
            <option>Skill Development</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Remarks</label>
          <textarea placeholder="Any specific notes..." rows={3} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
        </div>

        <div style={{ border: '2px dashed #ddd', borderRadius: '15px', padding: '40px', textAlign: 'center', cursor: 'pointer' }}>
          <Camera size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
          <h5>Upload Group Photo</h5>
          <p style={{ fontSize: '0.8rem', color: '#999' }}>Click to capture or upload</p>
        </div>

        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>Create Group</button>
      </form>
    </div>
  );
}
