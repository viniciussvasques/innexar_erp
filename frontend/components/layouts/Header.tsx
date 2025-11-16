'use client'

import { useTranslations } from 'next-intl'
import { Menu, LogOut, User, Settings, Search, ChevronDown, Sun, Moon, Monitor } from 'lucide-react'
import { NotificationsDropdown } from '@/components/hr/NotificationsDropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth'
import { useRouter } from '@/lib/i18n/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface HeaderProps {
  onMenuClick: () => void
  sidebarCollapsed: boolean
}

export function Header({ onMenuClick, sidebarCollapsed }: HeaderProps) {
  const t = useTranslations('auth')
  const tTheme = useTranslations('theme')
  const tUser = useTranslations('user')
  const tCommon = useTranslations('common')
  const user = useAuthStore(state => state.user)
  const clearAuth = useAuthStore(state => state.clearAuth)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await authApi.logout()
    clearAuth()
    router.push('/')
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={tCommon('search') + '...'}
                    className="w-64 pl-9 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-primary"
                  />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {!mounted ? (
                  <Monitor className="h-5 w-5" />
                ) : theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : theme === 'light' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
                <span className="sr-only">{tTheme('toggleTheme')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                <span>{tTheme('light')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                <span>{tTheme('dark')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                <span>{tTheme('system')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationsDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={undefined} alt={user?.name || user?.email} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-semibold text-sm">
                    {getInitials(user?.name, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-foreground">
                    {user?.name || tUser('user')}
                  </span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
                <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || tUser('user')}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <User className="mr-2 h-4 w-4" />
                <span>{tUser('profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{tUser('settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
