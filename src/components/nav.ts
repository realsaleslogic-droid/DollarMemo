import { LayoutDashboard, ArrowLeftRight, PieChart, Repeat, Landmark, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/reports', label: 'Reports', icon: PieChart },
  { href: '/recurring', label: 'Recurring', icon: Repeat },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
];
