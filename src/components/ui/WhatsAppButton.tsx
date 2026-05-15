'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SupportModal from './SupportModal';

const SupportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="support-float"
        aria-label="Contact Support"
      >
        <HelpCircle size={32} />
        <span className="tooltip text-[10px] font-black uppercase tracking-widest">Support</span>
      </button>

      <SupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style jsx global>{`
        .support-float {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #E91E63 0%, #6A1B9A 100%);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(233, 30, 99, 0.3);
          z-index: 999;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          cursor: pointer;
        }
        .support-float:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 40px rgba(233, 30, 99, 0.4);
        }
        .support-float .tooltip {
          position: absolute;
          right: 100%;
          margin-right: 15px;
          background: #2D1B36;
          color: white;
          padding: 8px 12px;
          border-radius: 12px;
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
          white-space: nowrap;
        }
        .support-float:hover .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-5px);
        }
        @media (max-width: 768px) {
          .support-float {
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 15px;
          }
          .support-float .tooltip {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default SupportButton;

