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
    
    // Try to logout on backend if we have a token
    // The interceptor will automatically add the tenant schema header
    if (refreshToken) {
      try {
        await apiClient.post('/api/v1/auth/logout/', { refresh: refreshToken })
      } catch (error) {
        // Even if backend logout fails, clear local storage
        // This ensures the user can always logout locally
        console.warn('Logout request failed, but clearing local storage anyway:', error)
      }
    }
    
    // Always clear local storage, even if backend request fails
    // This ensures logout always works, even if backend is unreachable
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('tenant_schema')
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
