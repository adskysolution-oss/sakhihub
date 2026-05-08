'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DigitalReceipt from '@/components/features/dashboard/DigitalReceipt';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function MemberReceiptPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axios.get(`/api/memberships/${id}`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReceipt();
  }, [id]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary)" />
    </div>
  );

  if (!data) return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h3>Receipt not found.</h3>
      <Link href="/member/dashboard">Return to Dashboard</Link>
    </div>
  );

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
        <Link href="/member/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontWeight: '700' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>
      <DigitalReceipt data={data} />
    </div>
  );
}
