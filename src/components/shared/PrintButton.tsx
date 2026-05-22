'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="btn-primary py-3 px-6 shadow-xl flex items-center gap-2 text-xs"
    >
      <Printer size={16} /> Print / Save PDF
    </button>
  );
}
