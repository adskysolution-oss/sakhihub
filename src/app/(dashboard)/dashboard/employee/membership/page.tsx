'use client';

import React, { useState } from "react";
import { CreditCard, CheckCircle, IndianRupee, ShieldCheck, Search } from "lucide-react";

export default function MembershipPage() {
  const [status, setStatus] = useState<'form' | 'processing' | 'success'>('form');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    // Simulate Razorpay Payment Gateway
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
          <CheckCircle size={50} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '400px' }}>
          The ₹100 membership fee has been received. The digital membership card will be generated shortly.
        </p>
        <button onClick={() => setStatus('form')} className="btn-primary">Add Another Member</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)' }}>Membership Activation</h2>
        <p style={{ color: 'var(--text-muted)' }}>Pay ₹100 for premium membership benefits and awareness kit.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        <form onSubmit={handlePayment} className="glass-card" style={{ padding: '40px', background: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Search Member (Mobile) *</label>
            <div style={{ position: 'relative' }}>
               <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#999' }} />
               <input required type="tel" placeholder="Enter Mobile to find member" style={{ padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Member Name</label>
            <input readOnly type="text" value="Automatic fetched name" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #eee', background: '#f9f9f9' }} />
          </div>

          <div style={{ padding: '20px', background: 'var(--bg-light)', borderRadius: '15px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Membership Fee</span>
              <span style={{ fontWeight: '700' }}>₹100.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '0.9rem' }}>
              <span>Processing Fee</span>
              <span>₹0.00</span>
            </div>
            <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px solid #ddd' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.2rem' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--primary)' }}>₹100.00</span>
            </div>
          </div>

          <button disabled={status === 'processing'} type="submit" className={status === 'processing' ? 'btn-secondary' : 'btn-primary'} style={{ justifyContent: 'center', padding: '15px' }}>
            <CreditCard size={20} /> {status === 'processing' ? 'Connecting Gateway...' : 'Pay ₹100 with Razorpay'}
          </button>
        </form>

        <div className="glass-card" style={{ padding: '30px', background: 'var(--grad-dark)', color: 'white' }}>
          <h4 style={{ marginBottom: '20px' }}>Premium Benefits</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', gap: '10px' }}><ShieldCheck size={18} /> Official Membership ID</li>
            <li style={{ listStyle: 'none', marginLeft: '28px', opacity: 0.8, fontSize: '0.8rem' }}>A professional digital ID for recognition.</li>
            <li style={{ display: 'flex', gap: '10px' }}><ShieldCheck size={18} /> Free Health Awareness Kit</li>
            <li style={{ listStyle: 'none', marginLeft: '28px', opacity: 0.8, fontSize: '0.8rem' }}>Essential hygiene products for the month.</li>
            <li style={{ display: 'flex', gap: '10px' }}><ShieldCheck size={18} /> Priority in Skill Workshops</li>
            <li style={{ listStyle: 'none', marginLeft: '28px', opacity: 0.8, fontSize: '0.8rem' }}>Early access to learning programs.</li>
          </ul>
          
          <div style={{ marginTop: '40px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
            <IndianRupee size={30} style={{ marginBottom: '10px', marginLeft: 'auto', marginRight: 'auto' }} />
            <p>Your payment is 100% secure with 256-bit encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

