import apiClient from './client'

export interface DashboardStats {
  sales: {
    total: string
    change_percent: number
    chart: Array<{ date: string; value: string }>
  }
  leads: {
    total: number
    new_today: number
    conversion_rate: number
  }
  receivable: {
    total: string
    overdue: string
  }
  payable?: {
    total: string
    overdue: string
  }
  tasks?: {
    total: number
    due_today: number
    overdue: number
  }
}

export interface DashboardParams {
  period?: '7d' | '30d' | '90d' | 'year' | 'custom'
  start_date?: string
  end_date?: string
}

export const analyticsApi = {
  getDashboard: async (params?: DashboardParams): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/api/v1/analytics/dashboard/', {
      params,
    })
    return response.data
  },

  generateReport: async (data: {
    type: string
    start_date: string
    end_date: string
    format?: 'pdf' | 'excel' | 'csv'
  }): Promise<{ report_id: string; download_url: string; expires_at: string }> => {
    const response = await apiClient.post('/api/v1/analytics/reports/', data)
    return response.data
  },
}

