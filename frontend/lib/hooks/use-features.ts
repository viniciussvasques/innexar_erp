'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/lib/store/authStore'

export type Plan = 'starter' | 'professional' | 'enterprise'

export interface FeatureConfig {
  module: string
  plans: Plan[]
  label: string
  icon?: string
}

// Configuração de módulos por plano
const MODULE_CONFIG: Record<string, FeatureConfig> = {
  dashboard: {
    module: 'dashboard',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Dashboard',
  },
  crm: {
    module: 'crm',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'CRM',
  },
  finance: {
    module: 'finance',
    plans: ['professional', 'enterprise'],
    label: 'Finance',
  },
  invoicing: {
    module: 'invoicing',
    plans: ['professional', 'enterprise'],
    label: 'Invoicing',
  },
  inventory: {
    module: 'inventory',
    plans: ['professional', 'enterprise'],
    label: 'Inventory',
  },
  projects: {
    module: 'projects',
    plans: ['enterprise'],
    label: 'Projects',
  },
  analytics: {
    module: 'analytics',
    plans: ['professional', 'enterprise'],
    label: 'Analytics',
  },
  integrations: {
    module: 'integrations',
    plans: ['enterprise'],
    label: 'Integrations',
  },
  settings: {
    module: 'settings',
    plans: ['starter', 'professional', 'enterprise'],
    label: 'Settings',
  },
}

/**
 * Hook para verificar se um módulo está disponível no plano atual
 */
export function useFeatures() {
  const user = useAuthStore(state => state.user)
  const plan = user?.tenant?.plan || 'starter'

  const hasFeature = (module: string): boolean => {
    const config = MODULE_CONFIG[module]
    if (!config) return false
    return config.plans.includes(plan as Plan)
  }

  const availableModules = useMemo(() => {
    return Object.values(MODULE_CONFIG).filter(config =>
      config.plans.includes(plan as Plan)
    )
  }, [plan])

  const getModuleConfig = (module: string): FeatureConfig | undefined => {
    return MODULE_CONFIG[module]
  }

  return {
    plan: plan as Plan,
    hasFeature,
    availableModules,
    getModuleConfig,
    isStarter: plan === 'starter',
    isProfessional: plan === 'professional',
    isEnterprise: plan === 'enterprise',
  }
}

/**
 * Hook para verificar se o tenant está em trial
 */
export function useTrial() {
  const user = useAuthStore(state => state.user)
  const trialEndsOn = user?.tenant?.trial_ends_on

  if (!trialEndsOn) {
    return {
      isTrial: false,
      daysRemaining: 0,
      isExpired: false,
    }
  }

  const today = new Date()
  const trialEnd = new Date(trialEndsOn)
  const daysRemaining = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysRemaining < 0

  return {
    isTrial: true,
    daysRemaining: isExpired ? 0 : daysRemaining,
    isExpired,
  }
}

