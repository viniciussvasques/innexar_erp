'use client'

import { useEffect } from 'react'
import { useRouter } from '@/lib/i18n/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para a página inicial que agora é o login
    router.replace('/')
  }, [router])

  return null
}
