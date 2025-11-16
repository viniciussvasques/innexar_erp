'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/lib/i18n/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { tenantsApi } from '@/lib/api/tenants'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved === 'true'
    }
    return false
  })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Check onboarding status
  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: () => tenantsApi.getOnboardingStatus(),
    retry: false,
    refetchOnWindowFocus: false,
  })

  // Fetch tenant settings to check language preference
  const { data: tenantSettings } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => tenantsApi.getTenantSettings(),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !onboardingStatus?.needs_onboarding, // Only fetch if onboarding is completed
  })

  useEffect(() => {
    if (onboardingStatus?.needs_onboarding) {
      setShowOnboarding(true)
    }
  }, [onboardingStatus])

  // Redirect to correct locale if tenant settings language differs from current locale
  useEffect(() => {
    if (tenantSettings?.language && !onboardingStatus?.needs_onboarding) {
      const settingsLanguage = tenantSettings.language
      
      // Only redirect if the language is different and not already redirecting
      if (settingsLanguage !== currentLocale) {
        console.log('Locale mismatch detected:', {
          settingsLanguage,
          currentLocale,
          pathname: window.location.pathname
        })
        
        // Update localStorage
        localStorage.setItem('locale', settingsLanguage)
        
        // Get current path without locale
        const currentPath = window.location.pathname
        // Remove current locale from path (e.g., /en/dashboard -> /dashboard)
        // Handle both /en/dashboard and /en/dashboard/ cases
        let pathWithoutLocale = currentPath
        for (const locale of ['en', 'pt', 'es']) {
          if (currentPath.startsWith(`/${locale}/`)) {
            pathWithoutLocale = currentPath.replace(`/${locale}/`, '/')
            break
          } else if (currentPath === `/${locale}`) {
            pathWithoutLocale = '/dashboard'
            break
          }
        }
        
        // Ensure path starts with /
        if (!pathWithoutLocale.startsWith('/')) {
          pathWithoutLocale = `/${pathWithoutLocale}`
        }
        
        // Build new path with correct locale
        const newPath = `/${settingsLanguage}${pathWithoutLocale}`
        
        console.log('Redirecting to:', newPath)
        
        // Only redirect if we're not already on the correct path
        if (currentPath !== newPath) {
          window.location.href = newPath
        }
      }
    }
  }, [tenantSettings?.language, currentLocale, onboardingStatus?.needs_onboarding])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
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
