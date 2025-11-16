import apiClient from './client'

export interface TenantSettings {
  id: number
  company_name: string
  legal_name?: string
  tax_id?: string
  registration_number?: string
  country: string
  currency: string
  timezone: string
  language: string
  date_format: string
  time_format: string
  business_type: string
  industry?: string
  main_activity: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  fiscal_year_start: string
  tax_regime?: string
  created_at: string
  updated_at: string
}

export interface Country {
  code: string
  name: string
  currency: string
  currency_symbol: string
  timezone: string
  language: string
}

export interface OnboardingStatus {
  needs_onboarding: boolean
  onboarding_completed: boolean
}

export interface OnboardingData {
  company_name: string
  legal_name?: string
  legal_entity_type?: string
  tax_id?: string
  registration_number?: string
  country: string
  currency: string
  timezone: string
  language: string
  date_format: string
  time_format: string
  business_type: string
  industry?: string
  main_activity: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  fiscal_year_start?: string
  tax_regime?: string
}

export interface OnboardingRequirements {
  required_fields: Record<string, boolean>
  field_labels: Record<string, string>
  country: string
  legal_entity_type?: string
}

export const tenantsApi = {
  getSettings: async (): Promise<TenantSettings> => {
    const response = await apiClient.get<TenantSettings>('/api/v1/tenants/settings/')
    return response.data
  },

  updateSettings: async (data: Partial<TenantSettings>): Promise<TenantSettings> => {
    const response = await apiClient.patch<TenantSettings>('/api/v1/tenants/settings/', data)
    return response.data
  },

  getOnboardingStatus: async (): Promise<OnboardingStatus> => {
    const response = await apiClient.get<OnboardingStatus>('/api/v1/tenants/onboarding/status/')
    return response.data
  },

  getCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get<Country[]>('/api/v1/tenants/onboarding/countries/')
    return response.data
  },

  getRequirements: async (country: string, legalEntityType?: string): Promise<OnboardingRequirements> => {
    const params: any = { country }
    if (legalEntityType) {
      params.legal_entity_type = legalEntityType
    }
    const response = await apiClient.get<OnboardingRequirements>('/api/v1/tenants/onboarding/requirements/', { params })
    return response.data
  },

  completeOnboarding: async (data: OnboardingData): Promise<TenantSettings> => {
    const response = await apiClient.post<TenantSettings>('/api/v1/tenants/onboarding/complete/', data)
    return response.data
  },

  getLocale: async (): Promise<{ locale: string; default: boolean }> => {
    const response = await apiClient.get<{ locale: string; default: boolean }>('/api/v1/tenants/onboarding/locale/')
    return response.data
  },
}

