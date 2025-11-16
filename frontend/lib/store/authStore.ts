import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string, tenantFromResponse?: any) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken, tenantFromResponse?: any) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Store tenant schema if available
        // Try in order: default_tenant.schema_name, tenant.schema_name, tenantFromResponse.schema_name
        const schema = user.default_tenant?.schema_name || 
                      user.tenant?.schema_name || 
                      tenantFromResponse?.schema_name
        
        if (schema) {
          localStorage.setItem('tenant_schema', schema)
          if (process.env.NODE_ENV === 'development') {
            console.log('[authStore] Saved tenant_schema:', schema, 'from:', {
              default_tenant: user.default_tenant?.schema_name,
              tenant: user.tenant?.schema_name,
              tenantFromResponse: tenantFromResponse?.schema_name
            })
          }
        } else {
          // If no schema found, remove it to avoid stale data
          localStorage.removeItem('tenant_schema')
          if (process.env.NODE_ENV === 'development') {
            console.warn('[authStore] No tenant_schema found. User:', user, 'tenantFromResponse:', tenantFromResponse)
          }
        }
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('tenant_schema')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
      updateUser: userData =>
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
