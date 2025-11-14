'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { useAuthStore } from '@/lib/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica se está autenticado
    const checkAuth = () => {
      const accessToken = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')

      if (!accessToken || !storedUser) {
        router.push('/')
        return
      }

      // Se o store não tem o usuário, tenta restaurar
      if (!user && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          useAuthStore.setState({
            user: parsedUser,
            accessToken,
            refreshToken: localStorage.getItem('refresh_token'),
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Error parsing user data:', error)
          router.push('/')
          return
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
