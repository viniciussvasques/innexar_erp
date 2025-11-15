'use client'

import { usePathname } from '@/lib/i18n/navigation'
import { Link } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'

interface SubMenuItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

interface HRSubmenuProps {
  isActive: boolean
  submenu: SubMenuItem[]
  onClose?: () => void
}

export function HRSubmenu({ isActive, submenu, onClose }: HRSubmenuProps) {
  const pathname = usePathname()

  // Sempre mostra o submenu quando o item principal está ativo
  if (!isActive) {
    return null
  }

  return (
    <div className="ml-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
      {submenu.map(subItem => {
        const SubIcon = subItem.icon
        if (!SubIcon) {
          console.error(`Icon is undefined for submenu item: ${subItem.href}`)
          return null
        }
        const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')
        return (
          <Link
            key={subItem.href}
            href={subItem.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-150',
              isSubActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50'
            )}
          >
            <SubIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{subItem.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

