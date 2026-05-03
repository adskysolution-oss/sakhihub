import React from "react";
import { UserPlus, Users, IndianRupee, Heart } from "lucide-react";

export default function AddMemberPage() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Add New Member</h2>
        <p style={{ color: 'var(--text-muted)' }}>Register a woman member to an existing group.</p>
      </div>

      <form className="glass-card" style={{ padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Select Group *</label>
          <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
            <option>Sakhi Group 1 - Rampur</option>
            <option>Sakhi Group 2 - Kashi</option>
            <option>Sakhi Group 3 - Bira</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Member Name *</label>
            <input type="text" placeholder="Full Name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number *</label>
            <input type="tel" placeholder="Mobile" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Age</label>
            <input type="number" placeholder="Years" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Occupation</label>
            <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}>
              <option>Housewife</option>
              <option>Farmer</option>
              <option>Self Employed</option>
              <option>Student</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Interested In (Multiple Selection)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {['Health Awareness', 'Sakhi Care Pads', 'Employment', 'Training', 'Volunteer'].map(item => (
              <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-light)', padding: '10px 15px', borderRadius: '8px' }}>
                <input type="checkbox" id={item} />
                <label htmlFor={item} style={{ fontSize: '0.85rem' }}>{item}</label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--accent)', padding: '20px', borderRadius: '15px', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '5px' }}>Paid Membership (₹100)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Join SakhiHub as a premium member</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="checkbox" id="paid" style={{ width: '20px', height: '20px' }} />
              <label htmlFor="paid" style={{ fontWeight: '700' }}>Yes, Add Paid</label>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>Add Member</button>
      </form>
    </div>
  );
}
