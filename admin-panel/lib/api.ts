import axios from 'axios';
import { LoginRequest, LoginResponse } from '@/types';

type TenantPayload = Record<string, unknown>;
type UserPayload = Record<string, unknown>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and tenant schema to requests
api.interceptors.request.use((config) => {
  if (globalThis.window !== undefined) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant schema header for django-tenants
    // Get tenant schema from localStorage first, then try user data
    let tenantSchema = localStorage.getItem('tenant_schema');
    
    // If no tenant schema in localStorage, try to get from user data
    if (!tenantSchema) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const schema = user.default_tenant?.schema_name || user.tenant?.schema_name;
          if (schema) {
            tenantSchema = schema;
            localStorage.setItem('tenant_schema', schema);
          }
        } catch (e) {
          console.warn('Failed to parse user data:', e);
        }
      }
    }
    
    // Add tenant schema header for non-public endpoints
    if (tenantSchema && !config.url?.includes('/public/')) {
      config.headers['X-DTS-SCHEMA'] = tenantSchema;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[apiClient] Adding X-DTS-SCHEMA: ${tenantSchema} for ${config.url}`);
      }
    } else if (!config.url?.includes('/public/')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[apiClient] No tenant_schema found for ${config.url}`);
      }
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_URL}/api/${API_VERSION}/public/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        if (refresh) {
          localStorage.setItem('refresh_token', refresh);
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Ensure tenant schema header is added to retry request
        const tenantSchema = localStorage.getItem('tenant_schema');
        if (tenantSchema && !originalRequest.url?.includes('/public/')) {
          originalRequest.headers['X-DTS-SCHEMA'] = tenantSchema;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        globalThis.location.href = '/login';
        throw refreshError;
      }
    }

    throw error;
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post(
      `${API_URL}/api/${API_VERSION}/public/auth/login/`,
      credentials
    );
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/public/auth/logout/', { refresh: refreshToken });
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant_schema');
  },

  me: async () => {
    const response = await api.get('/public/auth/me/');
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats/');
    return response.data;
  },

  // Tenants
  getTenants: async (params?: { page?: number; search?: string; plan?: string }) => {
    const response = await api.get('/admin/tenants/', { params });
    return response.data;
  },

  getTenant: async (id: number) => {
    const response = await api.get(`/admin/tenants/${id}/`);
    return response.data;
  },

  createTenant: async (data: TenantPayload) => {
    const response = await api.post('/admin/tenants/', data);
    return response.data;
  },

  updateTenant: async (id: number, data: TenantPayload) => {
    const response = await api.patch(`/admin/tenants/${id}/`, data);
    return response.data;
  },

  deleteTenant: async (id: number) => {
    await api.delete(`/admin/tenants/${id}/`);
  },

  // Users
  getUsers: async (params?: { page?: number; search?: string; tenant?: number }) => {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await api.get(`/admin/users/${id}/`);
    return response.data;
  },

  updateUser: async (id: number, data: UserPayload) => {
    const response = await api.patch(`/admin/users/${id}/`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await api.delete(`/admin/users/${id}/`);
  },

  // CRM
  getLeads: async (params?: { page?: number; search?: string; tenant?: number }) => {
    const response = await api.get('/admin/crm/leads/', { params });
    return response.data;
  },

  getContacts: async (params?: { page?: number; search?: string; tenant?: number }) => {
    const response = await api.get('/admin/crm/contacts/', { params });
    return response.data;
  },

  getDeals: async (params?: { page?: number; search?: string; tenant?: number }) => {
    const response = await api.get('/admin/crm/deals/', { params });
    return response.data;
  },
};

export default api;
