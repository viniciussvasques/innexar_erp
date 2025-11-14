'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ShoppingCart,
  DollarSign,
  Package,
  BarChart3,
  Settings,
  UserCircle,
  Calendar,
  FileText,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModulesForPlan } from '@/lib/modules';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  module?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Tenants',
    href: '/tenants',
    icon: Building2,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'CRM',
    href: '/crm',
    icon: UserCircle,
    module: 'crm',
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    module: 'sales',
  },
  {
    title: 'Financial',
    href: '/financial',
    icon: DollarSign,
    module: 'financial',
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    module: 'inventory',
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: Calendar,
    module: 'projects',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    module: 'reports',
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FileText,
    module: 'documents',
  },
];

const settingsItems: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  
  // Currently using enterprise plan (all modules available)
  // Will be fetched from backend based on tenant subscription
  const availableModules = getModulesForPlan('enterprise');

  const isModuleAvailable = (module?: string) => {
    if (!module) return true;
    return availableModules.some(m => m.id === module);
  };

  const filteredNavItems = navItems.filter(item => isModuleAvailable(item.module));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
              <span className="text-xl font-bold text-white">I</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">Innexar ERP</span>
              <span className="text-xs text-gray-500">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-gray-500')} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-6 space-y-1">
            <div className="mb-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              System
            </div>
            {settingsItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-gray-500')} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 p-4 border border-brand-100">
            <p className="text-xs font-bold text-brand-900 mb-1">Need help?</p>
            <p className="text-xs text-brand-700 mb-3">
              Check our documentation
            </p>
            <button className="w-full rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600 shadow-md transition-all">
              View Docs
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
