import { 
  LayoutDashboard, Users, Heart, Settings, User, 
  MapPin, IndianRupee, ClipboardList, Target, Layout, FileText,
  ShieldCheck
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
  { name: 'Resources', icon: Heart, href: '/member/resources' },
  { name: 'Profile', icon: User, href: '/member/profile' },
  { name: 'Settings', icon: Settings, href: '/member/settings' },
];

export const EMPLOYEE_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/employee/dashboard' },
  { name: 'My Groups', icon: Layout, href: '/employee/groups' },
  { name: 'Women Members', icon: Users, href: '/employee/members' },
  { name: 'Collections', icon: IndianRupee, href: '/employee/membership' },
  { name: 'Daily Reports', icon: ClipboardList, href: '/employee/reports' },
  { name: 'Campaigns', icon: Target, href: '/employee/campaigns' },
  { name: 'Profile', icon: User, href: '/employee/profile' },
];

export const ADMIN_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Vendors', icon: ShieldCheck, href: '/admin/vendors' },
  { name: 'Sub-Vendors', icon: Layout, href: '/admin/sub-vendors' },
  { name: 'Applications', icon: ClipboardList, href: '/admin/employees' },
  { name: 'All Groups', icon: Layout, href: '/admin/groups' },
  { name: 'All Members', icon: Users, href: '/admin/members' },
  { name: 'Memberships', icon: IndianRupee, href: '/admin/memberships' },
  { name: 'Campaigns', icon: Target, href: '/admin/campaigns' },
  { name: 'Activity Reports', icon: FileText, href: '/admin/reports' },
  { name: 'CMS Manage', icon: Settings, href: '/admin/cms' },
];

export const VENDOR_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/vendor/dashboard' },
  { name: 'My Campaigns', icon: Target, href: '/vendor/campaigns' },
  { name: 'Sub-Vendors', icon: Layout, href: '/vendor/sub-vendors' },
  { name: 'Employees', icon: ClipboardList, href: '/vendor/employees' },
  { name: 'Groups', icon: Users, href: '/vendor/groups' },
  { name: 'Members', icon: User, href: '/vendor/members' },
  { name: 'Payments', icon: IndianRupee, href: '/vendor/payments' },
  { name: 'Documents', icon: FileText, href: '/vendor/documents' },
  { name: 'Support', icon: Heart, href: '/vendor/support' },
];

export const SUBVENDOR_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/sub-vendor/dashboard' },
  { name: 'Campaigns', icon: Target, href: '/sub-vendor/campaigns' },
  { name: 'Employees', icon: ClipboardList, href: '/sub-vendor/employees' },
  { name: 'Groups', icon: Users, href: '/sub-vendor/groups' },
  { name: 'Members', icon: User, href: '/sub-vendor/members' },
  { name: 'Payments', icon: IndianRupee, href: '/sub-vendor/payments' },
  { name: 'Documents', icon: FileText, href: '/sub-vendor/documents' },
  { name: 'Support', icon: Heart, href: '/sub-vendor/support' },
];
