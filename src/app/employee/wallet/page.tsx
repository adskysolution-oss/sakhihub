'use client';

import React from 'react';
import UnifiedWalletView from '@/components/features/wallet/UnifiedWalletView';

export default function EmployeeWalletPage() {
  return (
    <UnifiedWalletView 
      role="employee" 
      title="My Earnings Wallet"
      subtitle="Review your community support incentives and direct operational rewards"
    />
  );
}
