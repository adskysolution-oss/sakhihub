'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users
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
  const { language, setLanguage, t } = useLanguage();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
  ];
  const router = useRouter();
  const navRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active sidebar item into view on route change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollActiveIntoView = () => {
      try {
        const container = navRef.current;
        if (!container) return;

        const activeEl = container.querySelector('[data-sidebar-active="true"]') as HTMLElement;
        if (!activeEl) return;

        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        // Check if the active item is visible in the container's viewport (with 10px buffer)
        const isVisible = (
          activeRect.top >= containerRect.top + 10 &&
          activeRect.bottom <= containerRect.bottom - 10
        );

        if (!isVisible) {
          activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Failed to scroll active sidebar item into view', err);
      }
    };

    // Run immediately and at staggered intervals to account for render updates & sidebar transition
    scrollActiveIntoView();
    const timer1 = setTimeout(scrollActiveIntoView, 100);
    const timer2 = setTimeout(scrollActiveIntoView, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

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
    if (user?.role === 'staff') {
      const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
      
      const items: any[] = [
        { section: 'Core', name: 'Dashboard', icon: LayoutDashboard, href: '/portal/dashboard' }
      ];

      const findIcon = (name: string) => {
        const link = ADMIN_DASHBOARD_LINKS.find(l => l.name === name);
        return link ? link.icon : User;
      };

      if (userPermissions.includes('network.view')) {
        items.push({ section: 'Core', name: 'Network Tree', icon: findIcon('Network Tree'), href: '/portal/network' });
      }
      if (userPermissions.includes('reports.view')) {
        items.push({ section: 'Core', name: 'Activity Reports', icon: findIcon('Activity Reports'), href: '/portal/reports' });
      }
      if (userPermissions.includes('vendors.view') ||
          userPermissions.includes('sub_vendors.view') ||
          userPermissions.includes('employees.view') ||
          userPermissions.includes('members.view')) {
        items.push({ section: 'Users', name: 'All Users', icon: findIcon('All Users'), href: '/admin/users' });
      }
      if (userPermissions.includes('vendors.view')) {
        items.push({ section: 'Users', name: 'Vendors', icon: findIcon('Vendors'), href: '/portal/vendors' });
      }
      if (userPermissions.includes('sub_vendors.view')) {
        items.push({ section: 'Users', name: 'Sub-Vendors', icon: findIcon('Sub-Vendors'), href: '/portal/sub-vendors' });
      }
      if (userPermissions.includes('employees.view')) {
        items.push({ section: 'Users', name: 'Employees', icon: findIcon('Employees'), href: '/portal/employees' });
      }
      if (userPermissions.includes('groups.view')) {
        items.push({ section: 'Users', name: 'All Groups', icon: findIcon('All Groups'), href: '/portal/groups' });
      }
      if (userPermissions.includes('members.view')) {
        items.push({ section: 'Users', name: 'All Members', icon: findIcon('All Members'), href: '/portal/members' });
      }
      if (userPermissions.includes('abha.view')) {
        items.push({ section: 'Users', name: 'ABHA', icon: findIcon('ABHA'), href: '/portal/abha' });
      }
      if (userPermissions.includes('recruitment.view')) {
        items.push({ section: 'Recruitment', name: 'Vacancies', icon: findIcon('Vacancies'), href: '/portal/recruitment' });
        items.push({ section: 'Recruitment', name: 'Applications', icon: findIcon('Applications'), href: '/portal/applications' });
      }
      if (userPermissions.includes('payments.view')) {
        items.push({ section: 'Operations', name: 'Memberships', icon: findIcon('Memberships'), href: '/portal/memberships' });
        items.push({ section: 'System & Finance', name: 'Offline Payments', icon: findIcon('Offline Payments'), href: '/portal/offline-payments' });
      }
      if (userPermissions.includes('campaigns.view')) {
        items.push({ section: 'Operations', name: 'Campaigns', icon: findIcon('Campaigns'), href: '/portal/campaigns' });
      }
      if (userPermissions.includes('projects.view')) {
        items.push({ section: 'Operations', name: 'Manage Projects', icon: findIcon('Manage Projects'), href: '/portal/projects' });
      }
      if (userPermissions.includes('products.view')) {
        items.push({ section: 'Operations', name: 'Manage Products', icon: findIcon('Manage Products'), href: '/portal/products' });
      }
      if (userPermissions.includes('support.view')) {
        items.push({ section: 'Operations', name: 'Support Queries', icon: findIcon('Support Queries'), href: '/portal/support-requests' });
      }
      if (userPermissions.includes('forms.view')) {
        items.push({ section: 'System & Finance', name: 'Dynamic Forms', icon: findIcon('Dynamic Forms'), href: '/portal/forms' });
      }

      // Always include Profile and Documents
      items.push({ section: 'Account', name: 'Profile', icon: User, href: '/portal/profile' });
      items.push({ section: 'Account', name: 'Documents', icon: FileText, href: '/portal/documents' });
      items.push({ section: 'Core', name: 'Training', icon: BookOpen, href: '/portal/training' });

      return items;
    }
    if (user?.role === 'operations_admin') {
      const restrictedHrefs = [
        '/admin/operations-admins',
        '/admin/permissions',
        '/admin/assignments',
        '/admin/activity-logs',
        '/admin/cms',
        '/admin/finance',
        '/admin/forms',
        '/admin/payment-config',
        '/admin/communication',
        '/admin/staff'
      ];
      const linkPermissionMap: Record<string, string> = {
        '/admin/network': 'network.view',
        '/admin/reports': 'reports.view',
        '/admin/vendors': 'vendors.view',
        '/admin/sub-vendors': 'sub_vendors.view',
        '/admin/employees': 'employees.view',
        '/admin/members': 'members.view',
        '/admin/memberships': 'payments.view',
      };
      const userPermissions = Array.isArray(user.permissions) ? user.permissions : [];
      const hasAnyUserView = userPermissions.includes('vendors.view') ||
        userPermissions.includes('sub_vendors.view') ||
        userPermissions.includes('employees.view') ||
        userPermissions.includes('members.view');

      return ADMIN_DASHBOARD_LINKS.filter(link => {
        if (restrictedHrefs.some(href => link.href.startsWith(href))) return false;
        if (link.section === 'Admin Management') return false;

        if (link.href === '/admin/users') {
          return hasAnyUserView;
        }

        const requiredPermission = linkPermissionMap[link.href];
        if (requiredPermission && !userPermissions.includes(requiredPermission)) {
          return false;
        }
        return true;
      });
    }
    if (user?.role === 'vendor') return VENDOR_DASHBOARD_LINKS;
    if (user?.role === 'sub_vendor') return SUBVENDOR_DASHBOARD_LINKS;
    if (user?.role === 'employee') {
      const isDC = ['District Coordinator', 'District Project Officer'].includes(user.designation || '');
      if (isDC) {
        const list = [...EMPLOYEE_DASHBOARD_LINKS];
        const groupsIndex = list.findIndex(l => l.name === 'My Groups' || l.href === '/employee/groups');
        const insertIndex = groupsIndex !== -1 ? groupsIndex + 1 : 2;
        list.splice(insertIndex, 0, {
          name: 'My Team',
          icon: Users,
          href: '/employee/dashboard/my-team'
        });
        return list;
      }
      return EMPLOYEE_DASHBOARD_LINKS;
    }

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

  const menuItems = getMenuItems() as any[];

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

            <nav ref={navRef} className="flex-1 p-5 overflow-y-auto">
              <div className="grid gap-2">
                {menuItems.map((item: any, index: number) => {
                  const isActive = pathname === item.href ||
                    (item.href.includes('/profile') && pathname.includes('/profile'));

                  const showSection = item.section && (index === 0 || menuItems[index - 1].section !== item.section);

                  return (
                    <React.Fragment key={item.name}>
                      {showSection && (
                        <div className="mt-4 mb-1 px-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.section}</span>
                        </div>
                      )}

                      {item.locked ? (
                        <button
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
                      ) : (
                        <Link
                          href={item.href}
                          data-sidebar-active={isActive ? "true" : undefined}
                          onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 no-underline ${isActive ? 'text-primary bg-[#FFF5F8] font-semibold shadow-sm' : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-secondary'}`}
                        >
                          <item.icon size={20} />
                          <span>{item.name}</span>
                        </Link>
                      )}
                    </React.Fragment>
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
                disabled
                title="Search is temporarily locked"
                placeholder={t('dashboardCommon.search', 'Search...')}
                className="pl-10 pr-4 py-2 rounded-xl border border-[#eee] bg-[#f8f9fa] w-[200px] lg:w-[300px] text-sm focus:outline-none cursor-not-allowed opacity-60"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Language Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-1.5 p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                onClick={() => setLangOpen(!langOpen)}
              >
                <Globe size={18} />
                <span className="text-xs font-bold uppercase hidden sm:block">
                  {languages.find((l) => l.code === language)?.name}
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl z-[100] w-[140px] border border-gray-100 max-h-[300px] overflow-y-auto overflow-x-hidden"
                  >
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code as any);
                          setLangOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-xs font-bold transition-colors border-none bg-transparent cursor-pointer ${
                          language === l.code ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-secondary'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </button>

            <Link
              href={['super_admin', 'operations_admin'].includes(user?.role) ? '/admin/profile' : (user?.role === 'staff' ? '/portal/profile' : `/${user?.role?.replace('_', '-')}/dashboard/profile`)}
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
                href={['super_admin', 'operations_admin'].includes(user?.role) ? '/admin/profile' : (user?.role === 'staff' ? '/portal/profile' : `/${user?.role?.replace('_', '-')}/dashboard/profile`)}
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
