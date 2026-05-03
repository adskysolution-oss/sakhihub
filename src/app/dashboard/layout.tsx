'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Calendar, 
  FileText, 
  CreditCard, 
  BookOpen, 
  LogOut,
  Menu,
  X,
  PlusCircle,
  Briefcase
} from 'lucide-react';
import styles from './Dashboard.module.css';

const sidebarLinks = [
  { name: 'Dashboard', href: '/dashboard/employee', icon: <LayoutDashboard size={20} /> },
  { name: 'My Profile', href: '/dashboard/employee/profile', icon: <UserCircle size={20} /> },
  { name: 'Active Campaigns', href: '/dashboard/employee/campaigns', icon: <Calendar size={20} /> },
  { name: 'Create Group', href: '/dashboard/employee/create-group', icon: <PlusCircle size={20} /> },
  { name: 'My Groups', href: '/dashboard/employee/groups', icon: <Users size={20} /> },
  { name: 'Add Member', href: '/dashboard/employee/add-member', icon: <PlusCircle size={20} /> },
  { name: 'Membership Collection', href: '/dashboard/employee/membership', icon: <CreditCard size={20} /> },
  { name: 'Daily Report', href: '/dashboard/employee/reports', icon: <FileText size={20} /> },
  { name: 'Training Material', href: '/dashboard/employee/training', icon: <BookOpen size={20} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
          {sidebarLinks.map((link) => (
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
          <button className={styles.logoutBtn}>
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
          <div className={styles.headerTitle}>
            Employee Portal
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userText}>
              <p className={styles.userName}>Sunita Sharma</p>
              <p className={styles.userRole}>Block Employee</p>
            </div>
            <div className={styles.userAvatar}>S</div>
          </div>
        </header>
        
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
