'use client';

import React, { useState } from "react";
import { User, Phone, MapPin, Briefcase, Lock, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', padding: '60px 20px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem' }}>Employee Registration</h2>
          <p style={{ color: 'var(--text-muted)' }}>Join SakhiHub and make a difference.</p>
        </div>

        <div className="glass-card" style={{ padding: '40px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 1 ? 'var(--primary)' : '#ccc' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>1</div>
              <span style={{ fontWeight: '600' }}>Personal</span>
            </div>
            <div style={{ width: '50px', height: '2px', background: '#eee', alignSelf: 'center' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 2 ? 'var(--primary)' : '#ccc' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>2</div>
              <span style={{ fontWeight: '600' }}>Professional</span>
            </div>
            <div style={{ width: '50px', height: '2px', background: '#eee', alignSelf: 'center' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: step >= 3 ? 'var(--primary)' : '#ccc' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>3</div>
              <span style={{ fontWeight: '600' }}>Documents</span>
            </div>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
                      <input type="text" placeholder="Enter Full Name" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
                      <input type="tel" placeholder="Enter Mobile" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>WhatsApp Number</label>
                    <input type="tel" placeholder="WhatsApp Number" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Gender</label>
                    <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }}>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Full Address</label>
                  <textarea rows={3} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }}></textarea>
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-primary" style={{ justifyContent: 'center' }}>Next Step</button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>District *</label>
                    <input type="text" placeholder="District" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Block / Tehsil *</label>
                    <input type="text" placeholder="Block" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Apply For *</label>
                  <select style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }}>
                    <option>Block Level Employee</option>
                    <option>District Coordinator</option>
                    <option>Volunteer</option>
                    <option>Delivery Partner</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Qualification</label>
                    <input type="text" placeholder="e.g. Graduate" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Experience (Years)</label>
                    <input type="number" placeholder="Years" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Next Step</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ border: '2px dashed #ddd', borderRadius: '15px', padding: '30px', textAlign: 'center', cursor: 'pointer' }}>
                    <Upload size={32} color="var(--primary)" style={{ marginBottom: '10px' }} />
                    <h5 style={{ fontSize: '0.9rem' }}>Upload Photo</h5>
                    <p style={{ fontSize: '0.7rem', color: '#999' }}>JPG, PNG (Max 2MB)</p>
                  </div>
                  <div style={{ border: '2px dashed #ddd', borderRadius: '15px', padding: '30px', textAlign: 'center', cursor: 'pointer' }}>
                    <Upload size={32} color="var(--primary)" style={{ marginBottom: '10px' }} />
                    <h5 style={{ fontSize: '0.9rem' }}>Upload ID Proof</h5>
                    <p style={{ fontSize: '0.7rem', color: '#999' }}>PDF, JPG (Max 5MB)</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Create Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
                    <input type="password" placeholder="Min 8 characters" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="checkbox" id="terms" />
                  <label htmlFor="terms" style={{ fontSize: '0.85rem' }}>I accept the Terms & Conditions and Privacy Policy</label>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Back</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Complete Registration</button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)' }}>
          Already registered? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Login Here</Link>
        </p>
      </div>
    </div>
  );
}
