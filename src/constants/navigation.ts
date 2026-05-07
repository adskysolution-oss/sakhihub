import { LayoutDashboard, Users, Heart, Settings, User } from 'lucide-react';

export const PUBLIC_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Programs', href: '/programs' },
  { name: 'Contact', href: '/contact' },
];

export const MEMBER_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard/member' },
  { name: 'My Group', icon: Users, href: '/dashboard/member/group' },
  { name: 'Resources', icon: Heart, href: '/dashboard/member/resources' },
  { name: 'Profile', icon: User, href: '/dashboard/member/profile' },
  { name: 'Settings', icon: Settings, href: '/dashboard/member/settings' },
];

export const ADMIN_DASHBOARD_LINKS = [
  { name: 'Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Employees', icon: User, href: '/admin/employees' },
  { name: 'Members', icon: Users, href: '/admin/members' },
];
