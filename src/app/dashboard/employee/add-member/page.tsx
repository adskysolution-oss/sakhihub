'use client';

import React from "react";
import { UserPlus, Phone, MapPin, Hash, Users } from "lucide-react";

export default function AddMemberPage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Add New Member</h2>
        <p style={{ color: 'var(--text-muted)' }}>Register a woman member to an existing Sakhi Group.</p>
      </div>

      <form className="glass-card" style={{ padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Full Name *</label>
            <div style={{ position: 'relative' }}>
              <input required type="text" placeholder="Enter Name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number *</label>
            <div style={{ position: 'relative' }}>
              <input required type="tel" placeholder="Enter Mobile" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Age *</label>
            <input required type="number" placeholder="Enter Age" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Select Group *</label>
            <select required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
              <option value="">Choose a Group</option>
              <option>Sakhi Group 1</option>
              <option>Sakhi Group 2</option>
              <option>Mahila Shakti</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Address *</label>
          <textarea required placeholder="Full residential address..." rows={3} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', padding: '20px', background: 'var(--bg-light)', borderRadius: '12px' }}>
          <input type="checkbox" style={{ marginTop: '5px' }} />
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            I confirm that the above information is correct and the member has consented to join the SakhiHub movement.
          </p>
        </div>

        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
          <UserPlus size={20} /> Add Member
        </button>
      </form>
    </div>
  );
}
