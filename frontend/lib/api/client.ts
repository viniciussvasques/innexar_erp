import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar token e tenant schema
apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token')
      const locale = localStorage.getItem('locale') || 'en'
      
      // Get tenant schema from user data or localStorage
      let tenantSchema = localStorage.getItem('tenant_schema')
      if (!tenantSchema) {
        // Try to get from user data
        const userStr = localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            if (user.default_tenant_schema) {
              tenantSchema = user.default_tenant_schema
              localStorage.setItem('tenant_schema', tenantSchema)
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

      // Add tenant schema header for django-tenants
      // This allows the backend to route to the correct tenant schema
      if (tenantSchema && !config.url?.includes('/api/v1/public/')) {
        config.headers['X-DTS-SCHEMA'] = tenantSchema
      }

      config.headers['Accept-Language'] = locale === 'pt' ? 'pt-BR' : locale
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor para refresh token e tratamento de erros
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Tratamento de 401 - Token expirado ou inválido
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Se for endpoint de login, não tenta refresh
      if (originalRequest.url?.includes('/auth/login/')) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/api/v1/public/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access, refresh: newRefresh } = response.data
        localStorage.setItem('access_token', access)
        if (newRefresh) {
          localStorage.setItem('refresh_token', newRefresh)
        }

        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Limpa dados de autenticação e redireciona
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        // Só redireciona se estiver no cliente e não for página de login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/'
        }

        return Promise.reject(refreshError)
      }
    }

    // Tratamento de outros erros comuns (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      if (error.response?.status === 403) {
        console.error('Forbidden: User does not have permission')
      } else if (error.response?.status === 404) {
        console.error('Not Found: Resource does not exist')
      } else if (error.response?.status === 500) {
        console.error('Server Error: Internal server error')
      } else if (!error.response) {
        // Erro de rede
        console.error('Network Error: Unable to connect to server')
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
