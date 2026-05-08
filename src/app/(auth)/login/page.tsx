'use client';

import React, { useState, useEffect } from "react";
import { Phone, Lock, Heart, ShieldCheck, Users, Briefcase, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

type Role = 'employee' | 'member';

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
        role: role,
      });

      if (response.data.success) {
        const user = response.data.data;
        if (user.role === 'super_admin') router.push('/admin/dashboard');
        else if (user.role === 'employee') router.push('/employee/dashboard');
        else router.push('/member/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials or unauthorized access");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '50px', background: 'white', borderRadius: '40px', boxShadow: '0 30px 100px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '15px', background: 'var(--accent)', borderRadius: '25px', color: 'var(--primary)', marginBottom: '20px' }}>
            <Heart size={40} fill="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>SakhiHub Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Login to access your field dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '15px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '15px', color: '#ef4444', fontSize: '0.85rem', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '25px', fontWeight: '700' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '15px', background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '15px', color: '#10b981', fontSize: '0.85rem', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '25px', fontWeight: '700' }}>
            <ShieldCheck size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Role Selection */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
            {(['member', 'employee'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '20px 15px',
                  borderRadius: '20px',
                  border: '2.5px solid',
                  borderColor: role === r ? 'var(--primary)' : '#f0f0f0',
                  background: role === r ? '#FFF5F8' : 'white',
                  color: role === r ? 'var(--primary)' : '#999',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                {r === 'employee' ? <Briefcase size={22} strokeWidth={2.5} /> : <Users size={22} strokeWidth={2.5} />}
                <span style={{ fontSize: '0.9rem', fontWeight: '800', textTransform: 'capitalize' }}>{r}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: '800', color: '#444' }}>Mobile Number / Email</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                required
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                type="text"
                placeholder="Enter Mobile or Email"
                style={{ padding: '16px 16px 16px 50px', borderRadius: '15px', border: '1px solid #eee', width: '100%', fontSize: '1rem', background: '#fcfcfc' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '800', color: '#444' }}>Password</label>
              <Link href="/forgot" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '800' }}>Forgot?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Enter Password"
                style={{ padding: '16px 16px 16px 50px', borderRadius: '15px', border: '1px solid #eee', width: '100%', fontSize: '1rem', background: '#fcfcfc' }}
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '18px', borderRadius: '18px', fontSize: '1.1rem', boxShadow: '0 20px 40px rgba(233, 30, 99, 0.2)' }}>
            {loading ? 'Verifying...' : 'Login to Dashboard'} <Sparkles size={20} style={{ marginLeft: '10px' }} />
          </button>
        </form>

        <div style={{ marginTop: '35px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600' }}>
            {role === 'member' ? "New to SakhiHub Movement?" : "Want to join our workforce?"} {' '}
            <Link href="/register" style={{ color: 'var(--primary)', fontWeight: '800', borderBottom: '2px solid var(--primary)' }}>Register Now</Link>
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '10px 0' }} />
          <Link href="/admin/login" style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '700', textDecoration: 'none' }}>
            Access Super Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}



