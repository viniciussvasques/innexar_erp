import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store/authStore'

/**
 * Hook que garante disponibilidade do tenant_schema antes de liberar requisições dependentes.
 * Estratégia: espera autenticação, tenta ler localStorage imediatamente e faz polling curto.
 */
export function useTenantSchemaReady(pollIntervalMs = 300, maxAttempts = 10) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(false)
      return
    }
    const schema = globalThis.window?.localStorage.getItem('tenant_schema')
    if (schema) {
      setReady(true)
      return
    }
    let attempts = 0
    const id = setInterval(() => {
      const s = globalThis.window?.localStorage.getItem('tenant_schema')
      if (s) {
        setReady(true)
        clearInterval(id)
      } else if (++attempts > maxAttempts) {
        clearInterval(id)
      }
    }, pollIntervalMs)
    return () => clearInterval(id)
  }, [isAuthenticated, pollIntervalMs, maxAttempts])

  return ready
}
