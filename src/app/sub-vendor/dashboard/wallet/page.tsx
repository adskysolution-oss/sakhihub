'use client';

import React from 'react';
import UnifiedWalletView from '@/components/features/wallet/UnifiedWalletView';

export default function SubVendorWalletPage() {
  return (
    <UnifiedWalletView 
      role="sub_vendor" 
      title="Sub-Vendor Wallet"
      subtitle="Track sub-vendor network commission shares, deposits, and payouts"
    />
  );
}
