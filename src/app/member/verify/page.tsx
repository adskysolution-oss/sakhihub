'use client';

import React, { useState } from 'react';
import { Search, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, MapPin, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemberVerifyPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // We'll use the existing membership API to find by receipt number or ID
      const res = await axios.get(`/api/member/verify-public?id=${query}`);
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.message || 'No record found.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Link href="/member/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', marginBottom: '30px', textDecoration: 'none' }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="glass-card" style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', background: '#FFF5F8', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
            <ShieldCheck size={35} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '10px' }}>Verify Membership</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Enter your Receipt Number or Membership ID to verify the authenticity of your registration.</p>

          <form onSubmit={handleVerify} style={{ position: 'relative', marginBottom: '30px' }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="e.g. REC-2026-XXXX or SH-2026-XXXX"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '18px 18px 18px 50px', borderRadius: '15px', border: '1px solid #eee', fontSize: '1.1rem', outline: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.02)' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                padding: '10px 20px', borderRadius: '10px', background: 'var(--grad-primary)',
                color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer'
              }}
            >
              {loading ? '...' : 'Verify'}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', background: '#fef2f2', color: '#ef4444', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <AlertCircle size={20} /> {error}
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'left' }}>
                <div style={{ padding: '25px', background: '#f0fdf4', borderRadius: '20px', border: '1px solid #dcfce7', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', marginBottom: '15px' }}>
                    <CheckCircle2 size={24} />
                    <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>Verified Member</span>
                  </div>

                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Member Name</span>
                      <span style={{ fontWeight: '800' }}>{result.member?.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Membership ID</span>
                      <span style={{ fontWeight: '800' }}>{result.membershipId}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Group Unit</span>
                      <span style={{ fontWeight: '800' }}>{result.groupId?.groupName || 'Direct'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Payment Status</span>
                      <span style={{ fontWeight: '900', color: '#16a34a' }}>PAID (Verified)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Verification Date</span>
                      <span style={{ fontWeight: '800' }}>{new Date(result.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '15px', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
                  This is a system-generated verification record for SakhiHub Membership.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
