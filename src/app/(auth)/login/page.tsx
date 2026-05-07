'use client';

import React, { useState, useEffect } from "react";
import { Phone, Lock, Heart, ShieldCheck, UserCircle, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

type Role = 'admin' | 'employee' | 'member';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess("Registration successful! Please login.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post('/api/auth/login', {
        ...formData,
        role: role === 'member' ? 'member' : role, // Match DB role names
      });

      if (response.data.success) {
        const user = response.data.data;
        if (user.role === 'admin') router.push('/admin/dashboard');
        else router.push('/dashboard/member');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials or unauthorized access");
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '10px', color: '#ef4444', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #10b981', borderRadius: '10px', color: '#10b981', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
            <ShieldCheck size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Role Selection */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {(['member', 'admin'] as Role[]).map((r) => (
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
                {r === 'member' && <Users size={18} />}
                {r}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Mobile Number / Email</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input 
                required 
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                type="text" 
                placeholder="Enter Mobile or Email" 
                style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Password</label>
              <Link href="/forgot" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
              <input 
                required 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password" 
                placeholder="Enter Password" 
                style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} 
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '15px' }}>
            {loading ? 'Authenticating...' : 'Login to Portal'}
          </button>
        </form>

        {role === 'member' && (
          <p style={{ textAlign: 'center', marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New to SakhiHub? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>Register Now</Link>
          </p>
        )}
      </div>
    </div>
  );
}



