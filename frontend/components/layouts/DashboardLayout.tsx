'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
// Removed unused navigation imports after refactor
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { tenantsApi } from '@/lib/api/tenants'
import { useTenantSchemaReady } from '@/lib/hooks/useTenantSchemaReady'

export function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = globalThis.window?.localStorage.getItem('sidebar-collapsed')
    return saved === 'true'
  })
  const [showOnboarding, setShowOnboarding] = useState(false)
  // const router = useRouter() // not needed after refactor
  // const pathname = usePathname() // not needed after refactor
  const currentLocale = useLocale()

  useEffect(() => {
    globalThis.window?.localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  const tenantReady = useTenantSchemaReady()

  // Check onboarding status (somente após schema resolvido)
  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: () => tenantsApi.getOnboardingStatus(),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: tenantReady,
  })

  // Fetch tenant settings to check language preference
  const { data: tenantSettings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => tenantsApi.getTenantSettings(),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: tenantReady && !onboardingStatus?.needs_onboarding, // Only fetch if onboarding is completed and schema pronto
  })

  useEffect(() => {
    if (tenantReady && onboardingStatus?.needs_onboarding) {
      setShowOnboarding(true)
    }
  }, [onboardingStatus, tenantReady])

  // Redirect to correct locale if tenant settings language differs from current locale
  useEffect(() => {
    if (!tenantReady || !tenantSettings?.language || onboardingStatus?.needs_onboarding) return
    const settingsLanguage = tenantSettings.language
    if (settingsLanguage === currentLocale) return
    const currentPath = globalThis.window?.location.pathname || '/'
    const stripLocale = (p: string) => {
      for (const locale of ['en', 'pt', 'es']) {
        if (p.startsWith(`/${locale}/`)) return p.replace(`/${locale}/`, '/')
        if (p === `/${locale}`) return '/dashboard'
      }
      return p
    }
    let pathWithoutLocale = stripLocale(currentPath)
    if (!pathWithoutLocale.startsWith('/')) pathWithoutLocale = '/' + pathWithoutLocale
    const newPath = `/${settingsLanguage}${pathWithoutLocale}`
    if (currentPath !== newPath) {
      globalThis.window.location.href = newPath
    }
  }, [tenantReady, tenantSettings?.language, currentLocale, onboardingStatus?.needs_onboarding])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (!tenantReady) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Carregando tenant...
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div
          className={sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]'}
          style={{ transition: 'padding-left 0.3s ease-in-out' }}
        >
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
        <OnboardingWizard
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </ProtectedRoute>
  )
}
