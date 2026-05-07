'use client';

import React, { useState } from "react";
import { Phone, Lock, Heart, ShieldCheck, UserCircle, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type Role = 'admin' | 'employee' | 'member';

export default function LoginPage() {
  const [role, setRole] = useState<Role>('employee');
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verification and redirect
    setTimeout(() => {
      setLoading(false);
      if (role === 'admin') window.location.href = '/admin/dashboard';
      else if (role === 'employee') window.location.href = '/dashboard/employee';
      else window.location.href = '/dashboard/member';
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '50px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '15px', background: 'var(--accent)', borderRadius: '20px', color: 'var(--primary)', marginBottom: '20px' }}>
            <Heart size={40} fill="var(--primary)" />
          </div>
          <h2 className="text-gradient">SakhiHub Portal</h2>
          <p style={{ color: 'var(--text-muted)' }}>Login to access your dashboard</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Role Selection */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              {(['member', 'employee', 'admin'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: role === r ? '2px solid var(--primary)' : '1px solid #ddd',
                    background: role === r ? 'var(--accent)' : 'white',
                    color: role === r ? 'var(--primary)' : '#666',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {r === 'admin' && <ShieldCheck size={18} />}
                  {r === 'employee' && <UserCircle size={18} />}
                  {r === 'member' && <Users size={18} />}
                  {r}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number / ID</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
                <input required type="text" placeholder="Enter Mobile or ID" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Password</label>
                <Link href="/forgot" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
                <input required type="password" placeholder="Enter Password" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
              {loading ? 'Processing...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter the 6-digit OTP sent to your registered mobile number.</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  style={{ width: '45px', height: '50px', textAlign: 'center', fontSize: '1.5rem', fontWeight: '700', borderRadius: '10px', border: '2px solid #ddd', outlineColor: 'var(--primary)' }}
                />
              ))}
            </div>

            <button disabled={loading} type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
              Back to Login
            </button>
          </form>
        )}

        {role === 'employee' && step === 1 && (
          <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New Employee? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register Now</Link>
          </p>
        )}
      </div>
    </div>
  );
}


