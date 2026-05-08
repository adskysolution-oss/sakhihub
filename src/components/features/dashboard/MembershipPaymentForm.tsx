'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, CreditCard, Wallet, Banknote, 
  CheckCircle, ArrowLeft, User, Search,
  QrCode, Printer, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function MembershipPaymentForm({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Online'>('Cash');
  const [receipt, setReceipt] = useState<any>(null);

  const searchMember = async () => {
    if (searchTerm.length < 3) return;
    try {
      const res = await axios.get(`/api/members?search=${searchTerm}`);
      if (res.data.success) setSearchResults(res.data.data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handlePayment = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/memberships', {
        memberId: selectedMember._id,
        groupId: selectedMember.groupId,
        amount: 100,
        paymentMode
      });
      if (res.data.success) {
        setReceipt(res.data.data);
      }
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '30px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '5px' }}>Payment Successful!</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>Digital receipt generated successfully.</p>
          
          <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '20px', textAlign: 'left', marginBottom: '30px', border: '1px dashed #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#777', fontSize: '0.9rem' }}>Membership ID</span>
              <span style={{ fontWeight: '800' }}>{receipt.membershipId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: '#777', fontSize: '0.9rem' }}>Member Name</span>
              <span style={{ fontWeight: '800' }}>{selectedMember?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <span style={{ color: '#777', fontSize: '1.1rem', fontWeight: '800' }}>Amount Paid</span>
              <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.1rem' }}>₹100.00</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <button className="btn-secondary" style={{ borderRadius: '15px', justifyContent: 'center' }}><Printer size={18} /> Print</button>
             <button className="btn-secondary" style={{ borderRadius: '15px', justifyContent: 'center' }}><Share2 size={18} /> Share</button>
          </div>
          <button onClick={onSuccess} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '15px', padding: '18px' }}>Done</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontWeight: '700' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--secondary)' }}>Collect Membership Fee</h2>
          <p style={{ color: 'var(--primary)', fontWeight: '700' }}>Process ₹100 fee for community activation</p>
        </div>

        {!selectedMember ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && searchMember()}
                  placeholder="Search Member by Name or Mobile..." 
                  style={{ padding: '18px 18px 18px 50px', borderRadius: '15px', border: '1px solid #eee', width: '100%', fontSize: '1.1rem' }} 
                />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {searchResults.map(member => (
                  <div key={member._id} onClick={() => setSelectedMember(member)} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: '#fcfcfc' }}>
                     <div>
                       <p style={{ margin: 0, fontWeight: '800' }}>{member.name}</p>
                       <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{member.mobile} • {member.village}</p>
                     </div>
                     <ArrowLeft size={18} style={{ transform: 'rotate(180deg)', color: 'var(--primary)' }} />
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ padding: '20px', background: '#FFF5F8', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
               <div style={{ width: '45px', height: '45px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><User size={20} /></div>
               <div>
                  <p style={{ margin: 0, fontWeight: '800' }}>{selectedMember.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)' }}>Group: {selectedMember.groupId?.groupName || 'Not Assigned'}</p>
               </div>
               <button onClick={() => setSelectedMember(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#777', fontSize: '0.8rem', cursor: 'pointer' }}>Change</button>
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '800', display: 'block', marginBottom: '15px' }}>Select Payment Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { id: 'Cash', icon: Banknote },
                  { id: 'UPI', icon: QrCode },
                  { id: 'Online', icon: CreditCard },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMode(mode.id as any)}
                    style={{
                      padding: '20px 10px',
                      borderRadius: '20px',
                      border: '2px solid',
                      borderColor: paymentMode === mode.id ? 'var(--primary)' : '#eee',
                      background: paymentMode === mode.id ? '#FFF5F8' : 'white',
                      color: paymentMode === mode.id ? 'var(--primary)' : '#666',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: '0.2s'
                    }}
                  >
                    <mode.icon size={24} />
                    {mode.id}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '25px', textAlign: 'center' }}>
               <p style={{ margin: 0, color: '#777', fontWeight: '600' }}>Amount to Pay</p>
               <h3 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--secondary)', margin: '5px 0' }}>₹100</h3>
               <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontWeight: '800' }}>Standard Membership Fee</p>
            </div>

            <button onClick={handlePayment} disabled={loading} className="btn-primary" style={{ padding: '22px', justifyContent: 'center', fontSize: '1.2rem' }}>
              {loading ? "Processing..." : `Confirm ₹100 ${paymentMode} Payment`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
