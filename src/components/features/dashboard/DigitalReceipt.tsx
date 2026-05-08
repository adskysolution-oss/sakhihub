'use client';

import React from 'react';
import { ShieldCheck, Download, Printer, User, MapPin, Calendar, CreditCard, Hash } from 'lucide-react';

interface ReceiptProps {
  data: {
    membershipId: string;
    receiptNumber: string;
    amount: number;
    paymentMode: string;
    paymentDate: string;
    member: {
      name: string;
      mobile: string;
      village: string;
    };
    group: {
      groupName: string;
      village: string;
    };
    employee?: {
      fullName: string;
    };
  };
}

export default function DigitalReceipt({ data }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container" style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ background: 'var(--grad-primary)', padding: '40px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0, letterSpacing: '1px' }}>SakhiHub</h2>
        <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Empowering Rural Women through Community</p>
        <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' }}>
          <ShieldCheck size={16} /> OFFICIAL DIGITAL RECEIPT
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px dashed #eee', paddingBottom: '20px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontWeight: '800' }}>RECEIPT NO.</p>
            <p style={{ margin: '5px 0 0', fontWeight: '800', fontSize: '1.1rem' }}>{data.receiptNumber}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#999', fontWeight: '800' }}>DATE</p>
            <p style={{ margin: '5px 0 0', fontWeight: '800', fontSize: '1.1rem' }}>{new Date(data.paymentDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: '#999', fontWeight: '800', marginBottom: '15px' }}>MEMBER DETAILS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={14} color="var(--primary)" /> {data.member.name}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>ID: {data.membershipId}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{data.member.village}</p>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', color: '#999', fontWeight: '800', marginBottom: '15px' }}>GROUP DETAILS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={14} color="var(--primary)" /> {data.group.groupName}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{data.group.village}</p>
              {data.employee && <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>By: {data.employee.fullName}</p>}
            </div>
          </div>
        </div>

        {/* Amount Table */}
        <div style={{ background: '#f8f9fa', borderRadius: '20px', padding: '25px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontWeight: '700', color: '#666' }}>Membership Registration Fee</span>
            <span style={{ fontWeight: '800' }}>₹{data.amount}</span>
          </div>
          <div style={{ borderTop: '2px solid white', paddingTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: '900', fontSize: '1.2rem' }}>Total Amount Paid</span>
            <span style={{ fontWeight: '900', fontSize: '1.2rem', color: 'var(--primary)' }}>₹{data.amount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#999', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CreditCard size={14} /> {data.paymentMode}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><ShieldCheck size={14} /> Paid & Verified</span>
          </div>
          <p style={{ margin: 0 }}>© SakhiHub Foundation</p>
        </div>
      </div>

      {/* Footer Actions (Hidden on Print) */}
      <div className="no-print" style={{ padding: '30px', borderTop: '1px solid #eee', display: 'flex', gap: '15px' }}>
        <button onClick={handlePrint} style={{ flex: 1, padding: '15px', borderRadius: '15px', background: '#f5f5f5', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Printer size={18} /> Print Receipt
        </button>
        <button onClick={handlePrint} style={{ flex: 1, padding: '15px', borderRadius: '15px', background: 'var(--grad-primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Download size={18} /> Download PDF
        </button>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-container { box-shadow: none !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
        }
      `}</style>
    </div>
  );
}
