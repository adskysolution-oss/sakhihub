'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  FileBarChart, 
  Globe, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import styles from '@/app/dashboard/Dashboard.module.css';

const adminLinks = [
  { name: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Leads & Inquiries', href: '/admin/leads', icon: <MessageSquare size={20} /> },
  { name: 'Regional Reports', href: '/admin/reports', icon: <FileBarChart size={20} /> },
  { name: 'CMS Content', href: '/admin/cms', icon: <Globe size={20} /> },
  { name: 'Manage Employees', href: '/admin/employees', icon: <UserCheck size={20} /> },
  { name: 'Member Network', href: '/admin/members', icon: <Users size={20} /> },
  { name: 'System Settings', href: '/admin/settings', icon: <Settings size={20} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            Sakhi<span>Hub</span>
          </Link>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className={styles.nav}>
          <div style={{ padding: '10px 20px', fontSize: '0.7rem', fontWeight: '800', color: '#999', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Panel</div>
          {adminLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          <button className={styles.logoutBtn} style={{ marginTop: 'auto' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className={styles.headerTitle} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color="var(--primary)" />
            Super Admin Control
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userText}>
              <p className={styles.userName}>Abhishek Gupta</p>
              <p className={styles.userRole}>Super Admin</p>
            </div>
            <div className={styles.userAvatar} style={{ background: 'var(--grad-primary)' }}>A</div>
          </div>
        </header>
        
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
