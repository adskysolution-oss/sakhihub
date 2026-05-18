'use client';

import React from 'react';
import UnifiedWalletView from '@/components/features/wallet/UnifiedWalletView';

export default function VendorWalletPage() {
  return (
    <UnifiedWalletView 
      role="vendor" 
      title="Vendor Wallet"
      subtitle="Real-time commission tracking, ledger history, and direct withdrawals"
    />
  );
}
