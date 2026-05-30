'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Globe,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  MEMBER_DASHBOARD_LINKS,
  ADMIN_DASHBOARD_LINKS,
  EMPLOYEE_DASHBOARD_LINKS,
  VENDOR_DASHBOARD_LINKS,
  SUBVENDOR_DASHBOARD_LINKS
} from '@/constants/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getProxiedImageUrl } from '@/utils/imageUrl';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data.success) {
          const userData = res.data.data;
          setUser(userData);

          // The proxy.ts middleware handles all page protection and redirects
          // based on dashboardAccess, documentsVerified, etc.
          // No frontend redirect needed here.
        }
      } catch (error) {
        console.error("Failed to fetch user session", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router, pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getMenuItems = () => {
    if (user?.role === 'super_admin') return ADMIN_DASHBOARD_LINKS;
    if (user?.role === 'vendor') return VENDOR_DASHBOARD_LINKS;
    if (user?.role === 'sub_vendor') return SUBVENDOR_DASHBOARD_LINKS;
    if (user?.role === 'employee') return EMPLOYEE_DASHBOARD_LINKS;
    if (user?.role === 'employee') return EMPLOYEE_DASHBOARD_LINKS;

    if (user?.role === 'member') {
      const isPaidVerified = user?.membershipType === 'paid' && (user?.accessStatus === 'unlocked' || user?.paymentStatus === 'completed');
      const isPremiumLocked = !isPaidVerified;

      return MEMBER_DASHBOARD_LINKS.map(link => {
        if (['My Group', 'Campaigns', 'Resources', 'My ID Card'].includes(link.name)) {
          return { ...link, locked: isPremiumLocked };
        }
        return link;
      });
    }

    return MEMBER_DASHBOARD_LINKS;
  };

  const menuItems = getMenuItems();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-500 font-semibold animate-pulse">{t('dashboardCommon.loadingSession', 'Loading Session...')}</p>
      </div>
    );
  }

  // Final Guard: If vendor is not approved, block entire layout rendering, EXCEPT for documents page where they need to re-upload
  if (user?.role === 'vendor' && !user?.dashboardAccess && pathname !== '/vendor/dashboard/documents') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 animate-bounce">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-black text-secondary">{t('dashboardCommon.verificationRequired', 'Verification Required')}</h2>
        <p className="text-gray-400 font-bold mt-2">{t('dashboardCommon.redirectingOnboarding', 'Redirecting to onboarding portal...')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed lg:relative top-0 left-0 h-full w-[280px] bg-white border-r border-[#eee] flex flex-col z-50 shadow-2xl lg:shadow-none"
          >
            <div className="p-6 md:p-8 border-b border-[#f5f5f5] flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-secondary no-underline">
                Sakhi<span className="text-primary">Hub</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-5 overflow-y-auto">
              <div className="grid gap-2">
                {menuItems.map((item: any) => {
                  const isActive = pathname === item.href ||
                    (item.href.includes('/profile') && pathname.includes('/profile'));

                  if (item.locked) {
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          import('sonner').then((mod) => {
                            mod.toast.error(`${t('dashboardCommon.premiumLocked', 'Premium Feature: Please upgrade or verify your membership to access')} ${item.name}`);
                          });
                        }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full text-left bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={20} />
                          <span>{item.name}</span>
                        </div>
                        <AlertCircle size={14} className="text-gray-300" />
                      </button>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline ${isActive ? 'text-primary bg-[#FFF5F8] font-semibold shadow-sm' : 'text-gray-500 font-medium hover:bg-gray-50'}`}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-[#f5f5f5] grid gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-secondary font-semibold hover:bg-gray-50 transition-all no-underline"
                >
                  <Globe size={20} className="text-primary" />
                  <span>{t('dashboardCommon.visitWebsite', 'Visit Website')}</span>
                </Link>
              </div>
            </nav>

            <div className="p-5 border-t border-[#f5f5f5]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-semibold bg-transparent border-none cursor-pointer hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span>{t('dashboardCommon.logout', 'Logout')}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Dashboard Header */}
        <header className="h-[70px] md:h-[80px] bg-white border-b border-[#eee] flex items-center justify-between px-4 sm:px-6 md:px-8 z-40 sticky top-0">
          <div className="flex items-center gap-2 md:gap-5">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('dashboardCommon.search', 'Search...')}
                className="pl-10 pr-4 py-2 rounded-xl border border-[#eee] bg-[#f8f9fa] w-[200px] lg:w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>

            <Link
              href={user?.role === 'super_admin' ? '/admin/profile' : `/${user?.role?.replace('_', '-')}/dashboard/profile`}
              className="flex items-center gap-3 pl-3 md:pl-5 border-l border-[#eee] no-underline group"
            >
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-secondary text-sm truncate max-w-[120px] group-hover:text-primary transition-colors">{user?.fullName}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm md:text-base shadow-lg shadow-primary/20 ring-2 ring-white overflow-hidden group-hover:ring-primary/30 transition-all">
                {user?.profileImage ? (
                  <img src={getProxiedImageUrl(user.profileImage)} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0)
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          {!user?.profileImage && !pathname.includes('/profile') && (
            <div className="mb-6 bg-rose-50 border border-rose-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-rose-900">{t('dashboardCommon.profileIncomplete', 'Profile Incomplete')}</h3>
                  <p className="text-xs font-medium text-rose-700 mt-0.5">{t('dashboardCommon.completeProfileMsg', 'Please add your profile picture and complete your profile details in the profile section.')}</p>
                </div>
              </div>
              <Link
                href={user?.role === 'super_admin' ? '/admin/profile' : `/${user?.role?.replace('_', '-')}/dashboard/profile`}
                className="shrink-0 w-full sm:w-auto text-center px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold tracking-wide hover:bg-rose-700 transition-colors shadow-sm"
              >
                {t('dashboardCommon.completeProfileBtn', 'Complete Profile')}
              </Link>
            </div>
          )}
          {(() => {
            if (user?.role === 'member') {
              const isPaidVerified = user?.membershipType === 'paid' && (user?.accessStatus === 'unlocked' || user?.paymentStatus === 'completed');
              const isPremiumLocked = !isPaidVerified;

              if (isPremiumLocked && ['/member/my-group', '/member/campaigns', '/member/resources'].some(r => pathname.startsWith(r))) {
                return (
                  <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white rounded-[35px] p-8 text-center border border-gray-100 shadow-sm mt-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-[25px] flex items-center justify-center text-amber-500 mb-6 border border-amber-100 shadow-inner">
                      <AlertCircle size={36} />
                    </div>
                    <h2 className="text-3xl font-black text-secondary mb-3">{t('dashboardCommon.premiumSectionLocked', 'Premium Section Locked')}</h2>
                    <p className="text-gray-400 font-bold mb-8 max-w-md mx-auto leading-relaxed">
                      {t('dashboardCommon.premiumLockedMsg', 'You are trying to access a premium feature. Please upgrade your free membership or verify your pending payment to unlock.')}
                    </p>
                    <Link href="/member/dashboard" className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg shadow-primary/20 font-bold hover:scale-105 transition-all">
                      {t('dashboardCommon.returnToDashboard', 'Return to Dashboard')}
                    </Link>
                  </div>
                );
              }
            }
            return children;
          })()}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
