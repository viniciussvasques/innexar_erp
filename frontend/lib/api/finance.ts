import apiClient from './client'
import { Account, Category, PaginatedResponse } from '@/types/api'

export interface FinanceDashboard {
  receivable_pending: string
  receivable_overdue: string
  payable_pending: string
  payable_overdue: string
  next_7_days: {
    receivable: string
    payable: string
  }
}

export interface CashFlowData {
  date: string
  inflow: string
  outflow: string
  balance: string
}

export interface CashFlowProjection {
  date: string
  expected_inflow: string
  expected_outflow: string
  projected_balance: string
}

export interface CashFlowResponse {
  data: CashFlowData[]
  projection?: CashFlowProjection[]
}

export const financeApi = {
  // Accounts
  getAccounts: async (params?: {
    page?: number
    page_size?: number
    type?: 'receivable' | 'payable'
    status?: string
    due_after?: string
    due_before?: string
    category_id?: number
    search?: string
  }): Promise<PaginatedResponse<Account>> => {
    const response = await apiClient.get<PaginatedResponse<Account>>('/api/v1/finance/accounts/', {
      params,
    })
    return response.data
  },

  getAccount: async (id: number): Promise<Account> => {
    const response = await apiClient.get<Account>(`/api/v1/finance/accounts/${id}/`)
    return response.data
  },

  createAccount: async (data: Partial<Account>): Promise<Account> => {
    const response = await apiClient.post<Account>('/api/v1/finance/accounts/', data)
    return response.data
  },

  updateAccount: async (id: number, data: Partial<Account>): Promise<Account> => {
    const response = await apiClient.patch<Account>(`/api/v1/finance/accounts/${id}/`, data)
    return response.data
  },

  deleteAccount: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/finance/accounts/${id}/`)
  },

  markAccountPaid: async (
    id: number,
    data: { paid_at?: string; payment_method?: string }
  ): Promise<Account> => {
    const response = await apiClient.post<Account>(`/api/v1/finance/accounts/${id}/mark_paid/`, data)
    return response.data
  },

  getFinanceDashboard: async (): Promise<FinanceDashboard> => {
    const response = await apiClient.get<FinanceDashboard>('/api/v1/finance/accounts/dashboard/')
    return response.data
  },

  // Categories
  getCategories: async (params?: {
    type?: 'income' | 'expense'
  }): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/api/v1/finance/categories/', { params })
    return response.data
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<Category>('/api/v1/finance/categories/', data)
    return response.data
  },

  // Cash Flow
  getCashFlow: async (params?: {
    start_date?: string
    end_date?: string
    projection?: boolean
  }): Promise<CashFlowResponse> => {
    const response = await apiClient.get<CashFlowResponse>('/api/v1/finance/cash-flow/', {
      params,
    })
    return response.data
  },
}

