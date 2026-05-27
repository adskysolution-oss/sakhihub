import {
  LayoutDashboard, Users, Heart, Settings, User,
  MapPin, IndianRupee, ClipboardList, Target, Layout, FileText,
  ShieldCheck, Mail, Sparkles, Wallet, ShoppingBag, BadgeCheck, Briefcase
} from 'lucide-react';

export const PUBLIC_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Programs', href: '/programs' },
  { name: 'Contact', href: '/contact' },
];

export const MEMBER_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/member/dashboard' },
  { name: 'My Group', icon: Users, href: '/member/my-group' },
  { name: 'Campaigns', icon: Target, href: '/member/campaigns' },
  { name: 'My Receipt', icon: FileText, href: '/member/receipt' },
  { name: 'Resources', icon: Heart, href: '/member/resources' },
  { name: 'My Profile', icon: User, href: '/member/dashboard/profile' },
  { name: 'My ID Card', icon: BadgeCheck, href: '/id-card' },
  { name: 'Verify Membership', icon: ShieldCheck, href: '/member/verify' },
  { name: 'Settings', icon: Settings, href: '/member/settings' },
];

export const EMPLOYEE_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/employee/dashboard' },
  { name: 'Member Requests', icon: Heart, href: '/employee/requests' },
  { name: 'My Groups', icon: Layout, href: '/employee/groups' },
  { name: 'Women Members', icon: Users, href: '/employee/members' },
  { name: 'My Wallet', icon: Wallet, href: '/employee/wallet' },
  { name: 'Daily Reports', icon: ClipboardList, href: '/employee/reports' },
  { name: 'Campaigns', icon: Target, href: '/employee/campaigns' },
  { name: 'Documents', icon: FileText, href: '/employee/dashboard/documents' },
  { name: 'My Profile', icon: User, href: '/employee/dashboard/profile' },
];

export const ADMIN_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Network Tree', icon: MapPin, href: '/admin/network' },
  { name: 'Vendors', icon: ShieldCheck, href: '/admin/vendors' },
  { name: 'Sub-Vendors', icon: Layout, href: '/admin/sub-vendors' },
  { name: 'Employees', icon: ClipboardList, href: '/admin/employees' },
  { name: 'Vacancies', icon: Briefcase, href: '/admin/careers/vacancies' },
  { name: 'Applications', icon: Users, href: '/admin/careers/applications' },
  { name: 'All Groups', icon: Layout, href: '/admin/groups' },
  { name: 'All Members', icon: Users, href: '/admin/members' },
  { name: 'Memberships', icon: IndianRupee, href: '/admin/memberships' },
  { name: 'Campaigns', icon: Target, href: '/admin/campaigns' },
  { name: 'Activity Reports', icon: FileText, href: '/admin/reports' },
  { name: 'Support Queries', icon: Mail, href: '/admin/support-requests' },
  { name: 'Manage Projects', icon: Sparkles, href: '/admin/projects' },
  { name: 'Manage Products', icon: ShoppingBag, href: '/admin/products' },
  { name: 'My Profile', icon: User, href: '/admin/profile' },
  { name: 'Payment Config', icon: IndianRupee, href: '/admin/payment-config' },
  { name: 'Finance Control', icon: Wallet, href: '/admin/finance' },
  { name: 'Dynamic Forms', icon: ClipboardList, href: '/admin/forms' },
  { name: 'CMS Manage', icon: Settings, href: '/admin/cms' },
];

export const VENDOR_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/vendor/dashboard' },
  { name: 'Network Mapping', icon: MapPin, href: '/vendor/dashboard/network' },
  { name: 'My Campaigns', icon: Target, href: '/vendor/dashboard/campaigns' },
  { name: 'Sub-Vendors', icon: Layout, href: '/vendor/dashboard/sub-vendors' },
  { name: 'Employees', icon: ClipboardList, href: '/vendor/dashboard/employees' },
  { name: 'Groups', icon: Users, href: '/vendor/dashboard/groups' },
  { name: 'Members', icon: User, href: '/vendor/dashboard/members' },
  { name: 'Payments', icon: IndianRupee, href: '/vendor/dashboard/payments' },
  { name: 'My Wallet', icon: Wallet, href: '/vendor/dashboard/wallet' },
  { name: 'Documents', icon: FileText, href: '/vendor/dashboard/documents' },
  { name: 'My Profile', icon: User, href: '/vendor/dashboard/profile' },
  { name: 'Support', icon: Heart, href: '/vendor/dashboard/support' },
];

export const SUBVENDOR_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/sub-vendor/dashboard' },
  { name: 'Network Mapping', icon: MapPin, href: '/sub-vendor/dashboard/network' },
  { name: 'Campaigns', icon: Target, href: '/sub-vendor/dashboard/campaigns' },
  { name: 'Employees', icon: ClipboardList, href: '/sub-vendor/dashboard/employees' },
  { name: 'Groups', icon: Users, href: '/sub-vendor/dashboard/groups' },
  { name: 'Members', icon: User, href: '/sub-vendor/dashboard/members' },
  { name: 'Payments', icon: IndianRupee, href: '/sub-vendor/dashboard/payments' },
  { name: 'My Wallet', icon: Wallet, href: '/sub-vendor/dashboard/wallet' },
  { name: 'Documents', icon: FileText, href: '/sub-vendor/dashboard/documents' },
  { name: 'My Profile', icon: User, href: '/sub-vendor/dashboard/profile' },
  { name: 'Support', icon: Heart, href: '/sub-vendor/dashboard/support' },
];
