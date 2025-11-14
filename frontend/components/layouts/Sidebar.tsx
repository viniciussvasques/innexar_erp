'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/lib/i18n/navigation'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  TrendingUp,
  FileText,
  DollarSign,
  Package,
  Settings,
  X,
  ChevronLeft,
  Sparkles,
  FolderKanban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// import { useFeatures } from '@/lib/hooks/use-features' // Desabilitado durante desenvolvimento

interface SidebarProps {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

interface MenuItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  module: string
  badge?: string
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const t = useTranslations('nav')
  // const tPlans = useTranslations('plans') // Desabilitado durante desenvolvimento
  const pathname = usePathname()
  // const { hasFeature, plan, isStarter } = useFeatures() // Desabilitado durante desenvolvimento

  const allMenuItems: MenuItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard'), module: 'dashboard' },
    { href: '/crm/leads', icon: UserPlus, label: t('leads'), module: 'crm' },
    { href: '/crm/contacts', icon: Users, label: t('contacts'), module: 'crm' },
    { href: '/crm/deals', icon: TrendingUp, label: t('deals'), module: 'crm' },
    { href: '/finance', icon: DollarSign, label: t('finance'), module: 'finance' },
    { href: '/invoicing', icon: FileText, label: t('invoicing'), module: 'invoicing' },
    { href: '/inventory', icon: Package, label: t('inventory'), module: 'inventory' },
    { href: '/projects', icon: FolderKanban, label: t('projects'), module: 'projects' },
    { href: '/settings', icon: Settings, label: t('settings'), module: 'settings' },
  ]

  // Durante desenvolvimento, mostra todos os módulos
  // TODO: Reativar filtro por plano em produção
  const menuItems = allMenuItems
  // const menuItems = allMenuItems.filter(item => {
  //   // CRM sempre disponível
  //   if (item.module === 'crm' || item.module === 'dashboard' || item.module === 'settings') {
  //     return true
  //   }
  //   return hasFeature(item.module)
  // })

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 lg:translate-x-0 shadow-sm',
          collapsed ? 'w-20' : 'w-[280px]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                Innexar
              </h1>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onToggleCollapse}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              // Durante desenvolvimento, todos os módulos estão disponíveis
              // TODO: Reativar verificação de plano em produção

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group relative cursor-pointer',
                    collapsed ? 'justify-center px-3' : '',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="relative">
                    <Icon
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive && 'text-white',
                        !isActive && 'text-slate-600 dark:text-slate-400'
                      )}
                    />
                  </div>
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  )}
                  {collapsed && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-full" />
                  )}
                </Link>
              )
            })}
        </nav>
      </aside>
    </>
  )
}
