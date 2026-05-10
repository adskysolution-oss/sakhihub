'use client';

import React, { useState } from "react";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import { 
  Settings as SettingsIcon, Bell, Globe, 
  Lock, LogOut, HelpCircle, Shield,
  ChevronRight, Trash2, Smartphone
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MemberSettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  interface SettingItem {
    label: string;
    value?: string;
    icon: React.ReactNode;
    toggle?: boolean;
  }

  interface SettingSection {
    title: string;
    items: SettingItem[];
  }

  const settingSections: SettingSection[] = [
    {
      title: "Account Preferences",
      items: [
        { label: "App Language", value: "Hinglish (English + Hindi)", icon: <Globe size={20} color="#6366f1" /> },
        { label: "Notification Settings", value: notifications ? "Enabled" : "Disabled", icon: <Bell size={20} color="#f59e0b" />, toggle: true },
        { label: "Login Security", value: "Manage Password", icon: <Lock size={20} color="#ef4444" /> }
      ]
    },
    {
      title: "Device & Privacy",
      items: [
        { label: "Active Sessions", value: "This Device Only", icon: <Smartphone size={20} color="#059669" /> },
        { label: "Privacy Policy", icon: <Shield size={20} color="#6a1b9a" /> },
        { label: "Help & Support", icon: <HelpCircle size={20} color="var(--primary)" /> }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '30px' }}>Settings</h1>
        
        <div style={{ display: 'grid', gap: '40px' }}>
          {settingSections.map((section, idx) => (
            <section key={idx}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>{section.title}</h3>
              <div style={{ background: 'white', borderRadius: '25px', border: '1px solid #eee', overflow: 'hidden' }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ 
                    padding: '20px 25px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: i === section.items.length - 1 ? 'none' : '1px solid #f5f5f5',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--secondary)' }}>{item.label}</p>
                        {item.value && <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>{item.value}</p>}
                      </div>
                    </div>
                    {item.toggle ? (
                      <div onClick={() => setNotifications(!notifications)} style={{ width: '45px', height: '24px', background: notifications ? 'var(--primary)' : '#ddd', borderRadius: '100px', position: 'relative', transition: '0.3s' }}>
                        <div style={{ position: 'absolute', left: notifications ? '23px' : '3px', top: '3px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: '0.3s' }}></div>
                      </div>
                    ) : (
                      <ChevronRight size={20} color="#ccc" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section>
             <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' }}>Account Actions</h3>
             <div style={{ display: 'grid', gap: '15px' }}>
                <button 
                  onClick={logout}
                  style={{ 
                    width: '100%', padding: '20px', borderRadius: '20px', 
                    background: '#FFF5F8', border: '1px solid #FCE7F3',
                    color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={22} /> Sign Out
                </button>
                <button 
                  style={{ 
                    width: '100%', padding: '20px', borderRadius: '20px', 
                    background: 'transparent', border: '1px solid #fee2e2',
                    color: '#ef4444', fontWeight: '800', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={18} /> Delete Account
                </button>
             </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
