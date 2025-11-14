import apiClient from './client'
import { Lead, Contact, Deal, Activity, PaginatedResponse } from '@/types/api'

export const crmApi = {
  // Leads
  getLeads: async (params?: {
    page?: number
    page_size?: number
    search?: string
    status?: string
    source?: string
    owner?: number
    score_min?: number
    score_max?: number
    created_after?: string
    created_before?: string
    ordering?: string
  }): Promise<PaginatedResponse<Lead>> => {
    const response = await apiClient.get<PaginatedResponse<Lead>>('/api/v1/crm/leads/', { params })
    return response.data
  },

  getLead: async (id: number): Promise<Lead> => {
    const response = await apiClient.get<Lead>(`/api/v1/crm/leads/${id}/`)
    return response.data
  },

  createLead: async (data: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.post<Lead>('/api/v1/crm/leads/', data)
    return response.data
  },

  updateLead: async (id: number, data: Partial<Lead>): Promise<Lead> => {
    const response = await apiClient.patch<Lead>(`/api/v1/crm/leads/${id}/`, data)
    return response.data
  },

  deleteLead: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/crm/leads/${id}/`)
  },

  convertLead: async (id: number): Promise<{ contact: Contact; deal: Deal }> => {
    const response = await apiClient.post<{ contact: Contact; deal: Deal }>(
      `/api/v1/crm/leads/${id}/convert/`
    )
    return response.data
  },

  // Contacts
  getContacts: async (params?: {
    page?: number
    page_size?: number
    search?: string
    is_customer?: boolean
    owner?: number
  }): Promise<PaginatedResponse<Contact>> => {
    const response = await apiClient.get<PaginatedResponse<Contact>>('/api/v1/crm/contacts/', {
      params,
    })
    return response.data
  },

  createContact: async (data: Partial<Contact>): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/api/v1/crm/contacts/', data)
    return response.data
  },

  updateContact: async (id: number, data: Partial<Contact>): Promise<Contact> => {
    const response = await apiClient.patch<Contact>(`/api/v1/crm/contacts/${id}/`, data)
    return response.data
  },

  deleteContact: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/crm/contacts/${id}/`)
  },

  // Deals
  getDeals: async (params?: {
    page?: number
    page_size?: number
    stage?: string
    owner?: number
    contact?: number
    search?: string
    value_min?: number
    value_max?: number
    ordering?: string
  }): Promise<PaginatedResponse<Deal>> => {
    const response = await apiClient.get<PaginatedResponse<Deal>>('/api/v1/crm/deals/', { params })
    return response.data
  },

  createDeal: async (data: Partial<Deal>): Promise<Deal> => {
    const response = await apiClient.post<Deal>('/api/v1/crm/deals/', data)
    return response.data
  },

  updateDeal: async (id: number, data: Partial<Deal>): Promise<Deal> => {
    const response = await apiClient.patch<Deal>(`/api/v1/crm/deals/${id}/`, data)
    return response.data
  },

  markDealWon: async (id: number): Promise<Deal> => {
    const response = await apiClient.post<Deal>(`/api/v1/crm/deals/${id}/mark_won/`)
    return response.data
  },

  markDealLost: async (id: number, reason?: string): Promise<Deal> => {
    const response = await apiClient.post<Deal>(`/api/v1/crm/deals/${id}/mark_lost/`, {
      lost_reason: reason,
    })
    return response.data
  },

  getDealsPipeline: async (): Promise<
    Array<{
      stage: string
      stage_name: string
      count: number
      total_amount: string
      total_expected_revenue: string
    }>
  > => {
    const response = await apiClient.get('/api/v1/crm/deals/pipeline/')
    return response.data
  },

  // Activities
  getActivities: async (params?: {
    activity_type?: string
    type?: string // Mantido para compatibilidade
    status?: string
    completed?: boolean // Mantido para compatibilidade
    owner?: number
    lead?: number
    contact?: number
    deal?: number
    search?: string
    due_before?: string // Mantido para compatibilidade
    ordering?: string
  }): Promise<PaginatedResponse<Activity>> => {
    const response = await apiClient.get<PaginatedResponse<Activity>>('/api/v1/crm/activities/', {
      params,
    })
    return response.data
  },

  createActivity: async (data: Partial<Activity>): Promise<Activity> => {
    const response = await apiClient.post<Activity>('/api/v1/crm/activities/', data)
    return response.data
  },

  completeActivity: async (id: number): Promise<Activity> => {
    const response = await apiClient.post<Activity>(`/api/v1/crm/activities/${id}/complete/`)
    return response.data
  },

  updateActivity: async (id: number, data: Partial<Activity>): Promise<Activity> => {
    const response = await apiClient.patch<Activity>(`/api/v1/crm/activities/${id}/`, data)
    return response.data
  },

  deleteActivity: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/crm/activities/${id}/`)
  },
}
