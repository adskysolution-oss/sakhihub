'use client';

import React from "react";
import { Phone, Lock, Heart } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', padding: '50px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '15px', background: 'var(--accent)', borderRadius: '20px', color: 'var(--primary)', marginBottom: '20px' }}>
            <Heart size={40} fill="var(--primary)" />
          </div>
          <h2 className="text-gradient">Employee Login</h2>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back to SakhiHub Portal</p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number / Employee ID</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input type="text" placeholder="Enter Mobile or ID" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Password</label>
              <Link href="/forgot" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input type="password" placeholder="Enter Password" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>Login</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          New Employee? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register Now</Link>
        </p>
      </div>
    </div>
  );
}
