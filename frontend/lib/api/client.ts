import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar token
apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token')
      const locale = localStorage.getItem('locale') || 'en'

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
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
    const originalRequest = error.config as any

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

    // Tratamento de outros erros comuns
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

    return Promise.reject(error)
  }
)

export default apiClient
