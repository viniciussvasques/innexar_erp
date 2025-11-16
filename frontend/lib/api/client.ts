import axios, { AxiosInstance, AxiosError } from 'axios'

// Controla logs redundantes de falta de tenant para evitar spam no console
let tenantSchemaWarned = false

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// --- Helpers --------------------------------------------------------------
const deriveSchemaFromUser = (): string | null => {
  const userStr = globalThis.window ? globalThis.window.localStorage.getItem('user') : null
  if (!userStr) return null
  try {
    const user = JSON.parse(userStr)
    return (
      user?.default_tenant?.schema_name ||
      user?.tenant?.schema_name ||
      null
    )
  } catch (e) {
    console.warn('[apiClient] Failed to parse user data:', e)
    return null
  }
}

const deriveSchemaFromJwt = (token: string): string | null => {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payloadJson = atob(parts[1].replaceAll('-', '+').replaceAll('_', '/'))
    const payload = JSON.parse(payloadJson)
    return (
      payload.tenant_schema ||
      payload.schema_name ||
      payload.schema ||
      payload.tenant?.schema_name ||
      null
    )
  } catch {
    return null
  }
}

const resolveTenantSchema = (accessToken?: string | null): string | null => {
  if (!globalThis.window) return null
  // 1. Direct localStorage
  let schema = globalThis.window.localStorage.getItem('tenant_schema')
  // 2. From user
  if (!schema) {
    schema = deriveSchemaFromUser() || schema
    if (schema) globalThis.window.localStorage.setItem('tenant_schema', schema)
  }
  // 3. From JWT payload
  if (!schema && accessToken) {
    schema = deriveSchemaFromJwt(accessToken) || schema
    if (schema) globalThis.window.localStorage.setItem('tenant_schema', schema)
  }
  return schema
}

const attachAuthAndTenant = (config: any): void => {
  if (!globalThis.window) return
  const accessToken = globalThis.window.localStorage.getItem('access_token')
  const locale = globalThis.window.localStorage.getItem('locale') || 'en'
  const tenantSchema = resolveTenantSchema(accessToken)

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (tenantSchema && !config.url?.includes('/api/v1/public/')) {
    config.headers['X-DTS-SCHEMA'] = tenantSchema
    if (process.env.NODE_ENV === 'development') {
      console.log(`[apiClient] Adding X-DTS-SCHEMA header: ${tenantSchema} for ${config.url}`)
    }
  } else if (!tenantSchema && !config.url?.includes('/api/v1/public/')) {
    if (!tenantSchemaWarned && process.env.NODE_ENV === 'development') {
      console.warn(`[apiClient] No tenant_schema found for ${config.url}. tenantSchema:`, tenantSchema)
      tenantSchemaWarned = true
    }
  }

  config.headers['Accept-Language'] = locale === 'pt' ? 'pt-BR' : locale
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para adicionar token e tenant schema
apiClient.interceptors.request.use(
  config => {
    attachAuthAndTenant(config)
    return config
  },
  error => { throw error }
)

// Response interceptor para refresh token e tratamento de erros
function handleResponseError(error: AxiosError) {
  const req = error.config as (typeof error.config & { _retry?: boolean }) | undefined
  if (!req) throw error
  const status = error.response?.status
  const shouldRefresh = status === 401 && !req._retry && !req.url?.includes('/auth/login/')
  if (shouldRefresh) return retryWithRefresh(req, error)
  logResponseError(status, error)
  throw error
}

async function retryWithRefresh(req: any, baseError: AxiosError) {
  req._retry = true
  const refreshToken = globalThis.window?.localStorage.getItem('refresh_token')
  if (!refreshToken) throw baseError
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/public/auth/token/refresh/`, { refresh: refreshToken })
    const { access, refresh: newRefresh } = response.data
    globalThis.window?.localStorage.setItem('access_token', access)
    if (newRefresh) globalThis.window?.localStorage.setItem('refresh_token', newRefresh)
    req.headers.Authorization = `Bearer ${access}`
    const tenantSchema = globalThis.window?.localStorage.getItem('tenant_schema')
    if (tenantSchema && !req.url?.includes('/api/v1/public/')) req.headers['X-DTS-SCHEMA'] = tenantSchema
    return apiClient(req)
  } catch (refreshError) {
    globalThis.window?.localStorage.removeItem('access_token')
    globalThis.window?.localStorage.removeItem('refresh_token')
    globalThis.window?.localStorage.removeItem('user')
    if (globalThis.window && !globalThis.window.location.pathname.includes('/login')) {
      globalThis.window.location.href = '/'
    }
    throw refreshError
  }
}

function logResponseError(status?: number, error?: AxiosError) {
  if (process.env.NODE_ENV !== 'development') return
  if (status === 403) console.error('Forbidden: User does not have permission')
  else if (status === 404) console.error('Not Found: Resource does not exist')
  else if (status === 500) console.error('Server Error: Internal server error')
  else if (!error?.response) console.error('Network Error: Unable to connect to server')
}

apiClient.interceptors.response.use(r => r, handleResponseError as any)

export default apiClient
