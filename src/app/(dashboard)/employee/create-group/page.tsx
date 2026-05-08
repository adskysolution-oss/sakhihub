import React from "react";
import { Users, MapPin, Camera } from "lucide-react";

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
            <input required type="text" placeholder="e.g. Mahila Shakti Group" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Village / Area *</label>
            <input required type="text" placeholder="Enter Village or Area" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>District *</label>
            <input required type="text" placeholder="Enter District" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>State *</label>
            <input required type="text" placeholder="Enter State" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
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


