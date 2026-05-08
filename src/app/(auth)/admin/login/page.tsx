'use client';

import React, { useState } from "react";
import { ShieldCheck, Lock, Phone, AlertCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post('/api/auth/login', {
        ...formData,
        role: 'admin', // Backend will allow super_admin for 'admin' role
      });

      if (response.data.success) {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid Admin Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '450px', width: '100%', padding: '50px', background: '#1e293b', borderRadius: '40px', boxShadow: '0 30px 100px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '25px', color: '#38bdf8', marginBottom: '20px' }}>
            <ShieldCheck size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '10px' }}>Super Admin</h2>
          <p style={{ color: '#94a3b8', fontWeight: '600' }}>Platform Command Center Login</p>
        </div>

        {error && (
          <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '15px', color: '#f87171', fontSize: '0.85rem', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '25px', fontWeight: '700' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: '800', color: '#cbd5e1' }}>Admin Identifier</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                required
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                type="text"
                placeholder="Mobile or Email"
                style={{ padding: '16px 16px 16px 50px', borderRadius: '15px', border: '1px solid #334155', width: '100%', fontSize: '1rem', background: '#0f172a', color: 'white' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: '800', color: '#cbd5e1' }}>Secret Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="••••••••"
                style={{ padding: '16px 16px 16px 50px', borderRadius: '15px', border: '1px solid #334155', width: '100%', fontSize: '1rem', background: '#0f172a', color: 'white' }}
              />
            </div>
          </div>

          <button disabled={loading} type="submit" style={{ 
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            padding: '18px',
            borderRadius: '18px',
            fontSize: '1.1rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 20px 40px rgba(2, 132, 199, 0.3)',
            transition: '0.2s'
          }}>
            {loading ? 'Authenticating...' : 'Secure Login'} <Sparkles size={20} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '30px', color: '#64748b', fontSize: '0.85rem' }}>
          This is a restricted area. Unauthorized access is monitored.
        </p>
      </div>
    </div>
  );
}
