import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Tenant, User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
    tenantFromResponse?: Tenant | null
  ) => void;
  clearAuth: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const resolveTenantSchema = (user?: User | null, fallbackTenant?: Tenant | null) => {
  return (
    user?.default_tenant?.schema_name ||
    user?.tenant?.schema_name ||
    fallbackTenant?.schema_name ||
    null
  );
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken, tenantFromResponse) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        if (globalThis.window !== undefined) {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Store tenant schema if available
          const schema = resolveTenantSchema(user, tenantFromResponse);
          if (schema) {
            localStorage.setItem('tenant_schema', schema);
            if (process.env.NODE_ENV === 'development') {
              console.log('[authStore] Saved tenant_schema:', schema);
            }
          } else {
            localStorage.removeItem('tenant_schema');
            if (process.env.NODE_ENV === 'development') {
              console.warn('[authStore] No tenant_schema found in user data');
            }
          }
        }
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        if (globalThis.window !== undefined) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant_schema');
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        if (globalThis.window !== undefined) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant_schema');
        }
      },

      updateUser: (user) => {
        set({ user });
        if (globalThis.window !== undefined) {
          localStorage.setItem('user', JSON.stringify(user));
          const schema = resolveTenantSchema(user);
          if (schema) {
            localStorage.setItem('tenant_schema', schema);
          } else {
            localStorage.removeItem('tenant_schema');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
