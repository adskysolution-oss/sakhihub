'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Heart, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

import { MEMBER_DASHBOARD_LINKS } from '@/constants/navigation';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { t } = useLanguage();

  const menuItems = MEMBER_DASHBOARD_LINKS;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa', overflow: 'hidden' }}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              width: '280px',
              background: '#fff',
              borderRight: '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 50,
              position: 'relative'
            }}
          >
            <div style={{ padding: '30px', borderBottom: '1px solid #f5f5f5' }}>
              <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--secondary)', textDecoration: 'none' }}>
                Sakhi<span style={{ color: 'var(--primary)' }}>Hub</span>
              </Link>
            </div>

            <nav style={{ flex: 1, padding: '20px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: pathname === item.href ? 'var(--primary)' : '#666',
                      background: pathname === item.href ? '#FFF5F8' : 'transparent',
                      fontWeight: pathname === item.href ? '700' : '500',
                      transition: '0.2s'
                    }}
                  >
                    <item.icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #f5f5f5' }}>
              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Dashboard Header */}
        <header style={{ 
          height: '80px', 
          background: '#fff', 
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                style={{ 
                  padding: '10px 15px 10px 40px', 
                  borderRadius: '10px', 
                  border: '1px solid #eee', 
                  background: '#f8f9fa',
                  width: '250px',
                  fontSize: '0.9rem'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
              <Bell size={22} />
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid #eee' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)', fontSize: '0.9rem' }}>Sunita Devi</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>Village Member</p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: '800' }}>
                S
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

