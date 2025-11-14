import apiClient from './client'
import { Invoice, InvoiceItem, PaginatedResponse } from '@/types/api'

export interface CreateInvoiceData {
  customer_id: number
  issue_date: string
  due_date: string
  currency: 'USD' | 'BRL' | 'MXN'
  items: Array<{
    description: string
    quantity: number
    unit_price: string
    discount?: string
    tax_rate?: number
  }>
  notes?: string
}

export const invoicingApi = {
  // Invoices
  getInvoices: async (params?: {
    page?: number
    page_size?: number
    status?: string
    customer_id?: number
    issue_date_after?: string
    issue_date_before?: string
    search?: string
  }): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get<PaginatedResponse<Invoice>>('/api/v1/invoicing/invoices/', {
      params,
    })
    return response.data
  },

  getInvoice: async (id: number): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/api/v1/invoicing/invoices/${id}/`)
    return response.data
  },

  createInvoice: async (data: CreateInvoiceData): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>('/api/v1/invoicing/invoices/', data)
    return response.data
  },

  updateInvoice: async (id: number, data: Partial<CreateInvoiceData>): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(`/api/v1/invoicing/invoices/${id}/`, data)
    return response.data
  },

  deleteInvoice: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/invoicing/invoices/${id}/`)
  },

  issueInvoice: async (id: number): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`/api/v1/invoicing/invoices/${id}/issue/`)
    return response.data
  },

  cancelInvoice: async (id: number, reason?: string): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`/api/v1/invoicing/invoices/${id}/cancel/`, {
      reason,
    })
    return response.data
  },

  createPaymentLink: async (id: number): Promise<{ payment_link: string }> => {
    const response = await apiClient.post<{ payment_link: string }>(
      `/api/v1/invoicing/invoices/${id}/payment_link/`
    )
    return response.data
  },
}

