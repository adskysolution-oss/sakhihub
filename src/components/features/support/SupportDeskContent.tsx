'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import axios from 'axios';
import CallerDeskContent from './CallerDeskContent';
import CaseManagementContent from './CaseManagementContent';

interface SupportDeskContentProps {
  mode?: 'caller' | 'management';
}

export default function SupportDeskContent({ mode }: SupportDeskContentProps) {
  const [activeMode, setActiveMode] = useState<'caller' | 'management' | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          const userObj = res.data.data;
          const isAdmin = ['super_admin', 'admin', 'operations_admin'].includes(userObj.role);
          setIsUserAdmin(isAdmin);
        }
      } catch (e) {
        console.error('Failed to parse user role via API', e);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (mode) {
      setActiveMode(mode);
      return;
    }

    // Fallback detection logic if mode prop is not provided (backward compatibility)
    const resolveFallbackMode = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          const userObj = res.data.data;
          const isAdmin = ['super_admin', 'admin', 'operations_admin'].includes(userObj.role) || 
                          (userObj.permissions || []).includes('support.update_case');
          setActiveMode(isAdmin ? 'management' : 'caller');
        } else {
          setActiveMode('caller');
        }
      } catch (e) {
        console.error('Failed to resolve default Support Desk mode via API', e);
        setActiveMode('caller');
      }
    };
    resolveFallbackMode();
  }, [mode]);

  if (!activeMode) {
    return (
      <div className="p-4 md:p-10 bg-[#f8f9fa] min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-400 font-bold animate-pulse">
          Initializing Support Desk Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Workspace Title Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-secondary flex items-center gap-3">
              <ClipboardList className="text-primary" size={36} />
              {activeMode === 'management' ? 'Case Management' : 'Caller Desk'}
            </h1>
            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
              {activeMode === 'management' 
                ? 'Administrative Support Desk Console' 
                : 'Support Executive Workspace'}
            </p>
          </div>

          {/* Admin Toggle Switcher */}
          {isUserAdmin && (
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-150 shadow-soft self-stretch md:self-auto">
              <button
                onClick={() => setActiveMode('management')}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeMode === 'management'
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/15'
                    : 'text-gray-400 hover:text-secondary'
                }`}
              >
                Case Queue
              </button>
              <button
                onClick={() => setActiveMode('caller')}
                className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeMode === 'caller'
                    ? 'bg-primary text-white shadow-lg shadow-primary/15'
                    : 'text-gray-400 hover:text-secondary'
                }`}
              >
                Caller Desk (Log Case)
              </button>
            </div>
          )}
        </header>

        {/* Workspace Body */}
        {activeMode === 'management' ? (
          <CaseManagementContent />
        ) : (
          <CallerDeskContent />
        )}

      </div>
    </div>
  );
}
