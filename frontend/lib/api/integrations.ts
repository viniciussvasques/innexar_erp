import apiClient from './client'

export interface Integration {
  id: number
  integration_type: string
  integration_type_display: string
  name: string
  status: 'inactive' | 'active' | 'error' | 'expired'
  status_display: string
  config: Record<string, any>
  is_active: boolean
  last_sync: string | null
  last_error: string | null
  error_count: number
  created_at: string
  updated_at: string
}

export interface QuickBooksIntegration {
  id: number
  integration: Integration
  realm_id: string
  company_name: string
  company_id: string
  sync_customers: boolean
  sync_invoices: boolean
  sync_payments: boolean
  sync_items: boolean
  sync_employees: boolean
  sync_direction: 'innexar_to_qb' | 'qb_to_innexar' | 'bidirectional'
  sync_direction_display: string
  auto_sync_enabled: boolean
  sync_interval_minutes: number
  is_token_expired: boolean
  created_at: string
  updated_at: string
}

export interface IntegrationLog {
  id: number
  integration: number
  integration_name: string
  log_type: 'sync' | 'auth' | 'error' | 'webhook' | 'manual'
  log_type_display: string
  message: string
  details: Record<string, any>
  success: boolean
  created_at: string
}

export const integrationsApi = {
  // Integrations
  getIntegrations: async (): Promise<Integration[]> => {
    const response = await apiClient.get<{ results: Integration[] }>('/api/v1/integrations/integrations/')
    return response.data.results
  },

  getIntegration: async (id: number): Promise<Integration> => {
    const response = await apiClient.get<Integration>(`/api/v1/integrations/integrations/${id}/`)
    return response.data
  },

  createIntegration: async (data: Partial<Integration>): Promise<Integration> => {
    const response = await apiClient.post<Integration>('/api/v1/integrations/integrations/', data)
    return response.data
  },

  updateIntegration: async (id: number, data: Partial<Integration>): Promise<Integration> => {
    const response = await apiClient.patch<Integration>(`/api/v1/integrations/integrations/${id}/`, data)
    return response.data
  },

  deleteIntegration: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/integrations/integrations/${id}/`)
  },

  activateIntegration: async (id: number): Promise<Integration> => {
    const response = await apiClient.post<{ integration: Integration }>(
      `/api/v1/integrations/integrations/${id}/activate/`
    )
    return response.data.integration
  },

  deactivateIntegration: async (id: number): Promise<Integration> => {
    const response = await apiClient.post<{ integration: Integration }>(
      `/api/v1/integrations/integrations/${id}/deactivate/`
    )
    return response.data.integration
  },

  syncIntegration: async (id: number): Promise<any> => {
    const response = await apiClient.post(`/api/v1/integrations/integrations/${id}/sync/`)
    return response.data
  },

  // QuickBooks
  getQuickBooksOAuthUrl: async (state?: string): Promise<{ auth_url: string; state: string }> => {
    const params = state ? { state } : {}
    const response = await apiClient.get<{ auth_url: string; state: string }>(
      '/api/v1/integrations/quickbooks/oauth_url/',
      { params }
    )
    return response.data
  },

  quickBooksOAuthCallback: async (code: string, realmId: string, state?: string): Promise<QuickBooksIntegration> => {
    const response = await apiClient.post<{ integration: QuickBooksIntegration }>(
      '/api/v1/integrations/quickbooks/oauth_callback/',
      { code, realm_id: realmId, state }
    )
    return response.data.integration
  },

  getQuickBooksIntegrations: async (): Promise<QuickBooksIntegration[]> => {
    const response = await apiClient.get<{ results: QuickBooksIntegration[] }>('/api/v1/integrations/quickbooks/')
    return response.data.results
  },

  getQuickBooksIntegration: async (id: number): Promise<QuickBooksIntegration> => {
    const response = await apiClient.get<QuickBooksIntegration>(`/api/v1/integrations/quickbooks/${id}/`)
    return response.data
  },

  updateQuickBooksIntegration: async (id: number, data: Partial<QuickBooksIntegration>): Promise<QuickBooksIntegration> => {
    const response = await apiClient.patch<QuickBooksIntegration>(
      `/api/v1/integrations/quickbooks/${id}/`,
      data
    )
    return response.data
  },

  refreshQuickBooksToken: async (id: number): Promise<void> => {
    await apiClient.post(`/api/v1/integrations/quickbooks/${id}/refresh_token/`)
  },

  testQuickBooksConnection: async (id: number): Promise<{ connected: boolean; company_info?: any; error?: string }> => {
    const response = await apiClient.get(`/api/v1/integrations/quickbooks/${id}/test_connection/`)
    return response.data
  },

  // Logs
  getIntegrationLogs: async (integrationId?: number): Promise<IntegrationLog[]> => {
    const params = integrationId ? { integration_id: integrationId } : {}
    const response = await apiClient.get<{ results: IntegrationLog[] }>(
      '/api/v1/integrations/logs/',
      { params }
    )
    return response.data.results
  },
}

