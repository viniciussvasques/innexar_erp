import axios from 'axios';
import { LoginRequest, LoginResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const api = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (globalThis.window !== undefined) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

  createTenant: async (data: any) => {
    const response = await api.post('/admin/tenants/', data);
    return response.data;
  },

  updateTenant: async (id: number, data: any) => {
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

  updateUser: async (id: number, data: any) => {
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
