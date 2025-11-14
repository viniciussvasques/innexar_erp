import apiClient from './client'
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types/api'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/public/auth/login/', credentials)
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/v1/public/tenants/', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      await apiClient.post('/api/v1/auth/logout/', { refresh: refreshToken })
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  refreshToken: async (refresh: string): Promise<{ access: string; refresh: string }> => {
    const response = await apiClient.post<{ access: string; refresh: string }>(
      '/api/v1/public/auth/token/refresh/',
      { refresh }
    )
    return response.data
  },

  resetPassword: async (email: string): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>(
      '/api/v1/public/auth/password/reset/',
      { email }
    )
    return response.data
  },

  confirmPasswordReset: async (data: {
    uid: string
    token: string
    new_password: string
  }): Promise<{ detail: string }> => {
    const response = await apiClient.post<{ detail: string }>(
      '/api/v1/public/auth/password/reset/confirm/',
      data
    )
    return response.data
  },
}
